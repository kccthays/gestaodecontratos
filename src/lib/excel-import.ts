import * as XLSX from "xlsx";
import { addDays, isValid, parse, parseISO, format } from "date-fns";
import type { Contract, ContractStatus, FlowStageId } from "@/types";
import { FLOW_STAGES, stageIndex } from "@/lib/flow-stages";
import { SeededRandom } from "@/lib/seed";
import {
  buildChecklist,
  buildDocumentos,
  buildFluxo,
  buildHistorico,
  gerarCNPJ,
  gerarSEI,
} from "@/lib/mock-data";

function normalizeHeader(header: string): string {
  return header
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const FIELD_SYNONYMS: Record<string, string[]> = {
  numero: ["numero", "numerocontrato", "contrato", "nrcontrato", "no"],
  empresa: ["empresa", "contratada", "fornecedor", "razaosocial"],
  cnpj: ["cnpj"],
  objeto: ["objeto", "descricao", "objetodocontrato"],
  fiscal: ["fiscal", "fiscaldocontrato", "gestor"],
  fiscalsubstituto: ["fiscalsubstituto", "fiscalsuplente"],
  valor: ["valor", "valorcontrato", "valorglobal", "valormensal"],
  datainicio: ["datainicio", "iniciovigencia", "vigenciainicio", "inicio"],
  datatermino: ["datatermino", "datafim", "vencimento", "terminovigencia", "vigenciafim", "fimvigencia"],
  processosei: ["processosei", "sei", "numerosei", "processo"],
  status: ["status", "situacao"],
  etapa: ["etapa", "etapaatual", "fasedoprocesso", "fase", "etapadofluxo"],
  responsavel: ["responsavel", "responsavelatual"],
  anoexercicio: ["ano", "anoexercicio", "exercicio"],
  templanodeacao: ["templanodeacao", "planodeacao"],
};

function findField(headers: string[], key: keyof typeof FIELD_SYNONYMS): number {
  const synonyms = FIELD_SYNONYMS[key];
  return headers.findIndex((h) => synonyms.includes(h));
}

function parseDateCell(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "number") {
    const parsedExcel = XLSX.SSF.parse_date_code(value);
    if (parsedExcel) {
      const d = new Date(parsedExcel.y, parsedExcel.m - 1, parsedExcel.d);
      if (isValid(d)) return format(d, "yyyy-MM-dd");
    }
  }
  if (value instanceof Date) {
    return isValid(value) ? format(value, "yyyy-MM-dd") : null;
  }
  const str = String(value).trim();
  const formats = ["dd/MM/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "MM/dd/yyyy"];
  for (const f of formats) {
    const d = parse(str, f, new Date());
    if (isValid(d)) return format(d, "yyyy-MM-dd");
  }
  try {
    const d = parseISO(str);
    if (isValid(d)) return format(d, "yyyy-MM-dd");
  } catch {
    // ignore
  }
  return null;
}

function parseValorCell(value: unknown): number {
  if (typeof value === "number") return value;
  if (!value) return 0;
  const cleaned = String(value)
    .replace(/[^\d,.-]/g, "")
    .replace(/\.(?=\d{3},)/g, "")
    .replace(",", ".");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function matchEtapa(value: unknown): FlowStageId | null {
  if (!value) return null;
  const norm = normalizeHeader(String(value));
  if (norm.includes("concluid") || norm.includes("vigente") || norm.includes("novavigencia")) return "nova-vigencia";
  for (const stage of FLOW_STAGES) {
    const stageNorm = normalizeHeader(stage.nome);
    if (norm.includes(stageNorm) || stageNorm.includes(norm)) return stage.id;
  }
  if (norm.includes("cdo")) return "aguardando-cdo";
  if (norm.includes("juridic")) return "juridico";
  if (norm.includes("assinatur")) return "assinaturas";
  if (norm.includes("public")) return "publicacao";
  if (norm.includes("fiscaliz")) return "fiscalizacao";
  if (norm.includes("tecnic")) return "area-tecnica";
  if (norm.includes("solicit")) return "solicitacao";
  return null;
}

function contractStatusFromStage(stageId: FlowStageId): ContractStatus {
  if (stageId === "nova-vigencia") return "vigente";
  if (stageId === "assinaturas") return "aguardando-assinatura";
  return "em-prorrogacao";
}

export interface ImportResult {
  contratos: Contract[];
  avisos: string[];
  linhasProcessadas: number;
  linhasIgnoradas: number;
}

export async function parseContractsWorkbook(file: File): Promise<ImportResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array", cellDates: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false });

  if (rows.length < 2) {
    return { contratos: [], avisos: ["A planilha não contém linhas de dados."], linhasProcessadas: 0, linhasIgnoradas: 0 };
  }

  const rawHeaders = (rows[0] as unknown[]).map((h) => normalizeHeader(String(h ?? "")));
  const avisos: string[] = [];

  const idx = {
    numero: findField(rawHeaders, "numero"),
    empresa: findField(rawHeaders, "empresa"),
    cnpj: findField(rawHeaders, "cnpj"),
    objeto: findField(rawHeaders, "objeto"),
    fiscal: findField(rawHeaders, "fiscal"),
    fiscalSubstituto: findField(rawHeaders, "fiscalsubstituto"),
    valor: findField(rawHeaders, "valor"),
    dataInicio: findField(rawHeaders, "datainicio"),
    dataTermino: findField(rawHeaders, "datatermino"),
    processoSEI: findField(rawHeaders, "processosei"),
    status: findField(rawHeaders, "status"),
    etapa: findField(rawHeaders, "etapa"),
    responsavel: findField(rawHeaders, "responsavel"),
    anoExercicio: findField(rawHeaders, "anoexercicio"),
    temPlanoDeAcao: findField(rawHeaders, "templanodeacao"),
  };

  if (idx.numero === -1 || idx.empresa === -1 || idx.dataTermino === -1) {
    avisos.push(
      'Colunas obrigatórias não encontradas. É necessário ao menos "Número", "Empresa" e "Data de Término/Vencimento".'
    );
    return { contratos: [], avisos, linhasProcessadas: 0, linhasIgnoradas: rows.length - 1 };
  }

  const contratos: Contract[] = [];
  let ignoradas = 0;

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r] as unknown[];
    if (!row || row.length === 0) continue;

    const numero = row[idx.numero];
    const empresa = row[idx.empresa];
    const dataTermino = parseDateCell(row[idx.dataTermino]);

    if (!numero || !empresa || !dataTermino) {
      ignoradas += 1;
      avisos.push(`Linha ${r + 1} ignorada: dados obrigatórios ausentes ou data inválida.`);
      continue;
    }

    const rnd = new SeededRandom(hashString(String(numero)) + r);
    const fiscal = idx.fiscal !== -1 ? String(row[idx.fiscal] ?? "") || "Não informado" : "Não informado";
    const etapaAtualId = (idx.etapa !== -1 ? matchEtapa(row[idx.etapa]) : null) ?? matchEtapa(idx.status !== -1 ? row[idx.status] : null) ?? "planejamento";
    const fluxo = buildFluxo(etapaAtualId, rnd, fiscal);
    const estadoAtual = fluxo.find((f) => f.stageId === etapaAtualId);
    const stageMeta = FLOW_STAGES.find((s) => s.id === etapaAtualId)!;
    const concluido = etapaAtualId === "nova-vigencia";
    const progresso = (stageIndex(etapaAtualId) + 1) / FLOW_STAGES.length;
    const dataInicio =
      (idx.dataInicio !== -1 ? parseDateCell(row[idx.dataInicio]) : null) ??
      format(addDays(parseISO(dataTermino), -365), "yyyy-MM-dd");

    contratos.push({
      id: `imp-${r}-${hashString(String(numero))}`,
      numero: String(numero),
      empresa: String(empresa),
      cnpj: idx.cnpj !== -1 && row[idx.cnpj] ? String(row[idx.cnpj]) : gerarCNPJ(rnd),
      objeto: idx.objeto !== -1 && row[idx.objeto] ? String(row[idx.objeto]) : "Objeto não informado na planilha",
      fiscal,
      fiscalSubstituto: idx.fiscalSubstituto !== -1 ? (row[idx.fiscalSubstituto] ? String(row[idx.fiscalSubstituto]) : undefined) : undefined,
      valor: idx.valor !== -1 ? parseValorCell(row[idx.valor]) : 0,
      dataInicio,
      dataTermino,
      processoSEI: idx.processoSEI !== -1 && row[idx.processoSEI] ? String(row[idx.processoSEI]) : gerarSEI(rnd, new Date(dataTermino).getFullYear()),
      status: contractStatusFromStage(etapaAtualId),
      ultimaMovimentacao: estadoAtual?.ultimaMovimentacao || format(new Date(), "yyyy-MM-dd"),
      ultimaMovimentacaoDescricao: `Etapa "${stageMeta.nome}" — importado da planilha`,
      responsavelAtual: idx.responsavel !== -1 && row[idx.responsavel] ? String(row[idx.responsavel]) : estadoAtual?.responsavel ?? "Coordenação de Contratos",
      etapaAtualId,
      fluxo,
      historico: buildHistorico(fluxo, String(numero)),
      documentos: buildDocumentos(rnd, progresso),
      checklist: buildChecklist(rnd, progresso),
      anoExercicio: idx.anoExercicio !== -1 && row[idx.anoExercicio] ? Number(row[idx.anoExercicio]) : new Date(dataInicio).getFullYear(),
      temPlanoDeAcao: idx.temPlanoDeAcao !== -1 ? Boolean(row[idx.temPlanoDeAcao]) : true,
      observacaoStatus: concluido ? "TA concluído" : stageMeta.nome,
      diasAntecedenciaConclusao: concluido ? rnd.int(80, 130) : undefined,
    });
  }

  return { contratos, avisos, linhasProcessadas: contratos.length, linhasIgnoradas: ignoradas };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function gerarModeloPlanilha(): void {
  const dados = [
    [
      "Numero",
      "Empresa",
      "CNPJ",
      "Objeto",
      "Fiscal",
      "Valor",
      "Data Inicio",
      "Data Termino",
      "Processo SEI",
      "Etapa",
      "Responsavel",
    ],
    [
      "31/2026",
      "Exemplo Serviços Ltda.",
      "12.345.678/0001-90",
      "Manutenção predial",
      "Fulano de Tal",
      "250000",
      "01/01/2024",
      "01/01/2027",
      "23480.000001/2026-10",
      "Fiscalização",
      "Fulano de Tal",
    ],
  ];
  const ws = XLSX.utils.aoa_to_sheet(dados);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Contratos");
  XLSX.writeFile(wb, "modelo-importacao-sigc.xlsx");
}
