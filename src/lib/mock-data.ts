import { addDays, format, subDays } from "date-fns";
import type {
  CalendarEvent,
  ChecklistItem,
  Contract,
  ContractStatus,
  DocumentoContrato,
  FlowStageId,
  FlowStageState,
  HistoricoEvento,
  Penalty,
  PenaltyCategory,
} from "@/types";
import { FLOW_STAGES, stageIndex } from "@/lib/flow-stages";
import { SeededRandom } from "@/lib/seed";
import { isConcluido } from "@/lib/calculations";
import { DOCUMENTOS_PRORROGACAO } from "@/lib/documentos-prorrogacao";

export const HOJE = new Date(2026, 6, 16);
export const STREAK_DESDE = format(subDays(HOJE, 47), "yyyy-MM-dd");

const iso = (d: Date) => format(d, "yyyy-MM-dd");

// Dados de demonstração — empresas, pessoas e valores são todos fictícios,
// gerados apenas para exemplo. Não representam contratos, empresas ou pessoas reais.
const EMPRESAS: { nome: string; objeto: string }[] = [
  { nome: "Empresa Contratada 01 Ltda.", objeto: "Manutenção preventiva e corretiva de elevadores e plataformas" },
  { nome: "Empresa Contratada 02 Ltda.", objeto: "Limpeza, conservação e higienização predial" },
  { nome: "Empresa Contratada 03 Ltda.", objeto: "Vigilância armada e desarmada nas dependências" },
  { nome: "Empresa Contratada 04 Ltda.", objeto: "Suporte técnico e manutenção de infraestrutura de redes" },
  { nome: "Empresa Contratada 05 Ltda.", objeto: "Manutenção predial e pequenas reformas" },
  { nome: "Empresa Contratada 06 Ltda.", objeto: "Fornecimento de refeições coletivas" },
  { nome: "Empresa Contratada 07 Ltda.", objeto: "Manutenção de sistemas de climatização e refrigeração" },
  { nome: "Empresa Contratada 08 Ltda.", objeto: "Serviços de impressão, reprografia e editoração" },
  { nome: "Empresa Contratada 09 Ltda.", objeto: "Gestão de facilities, portaria e recepção" },
  { nome: "Empresa Contratada 10 Ltda.", objeto: "Fornecimento de combustíveis para frota oficial" },
  { nome: "Empresa Contratada 11 Ltda.", objeto: "Locação de veículos oficiais com motorista" },
  { nome: "Empresa Contratada 12 Ltda.", objeto: "Monitoramento eletrônico e circuito interno de câmeras" },
  { nome: "Empresa Contratada 13 Ltda.", objeto: "Manutenção de áreas verdes e paisagismo" },
  { nome: "Empresa Contratada 14 Ltda.", objeto: "Hospedagem de dados, nuvem e backup corporativo" },
  { nome: "Empresa Contratada 15 Ltda.", objeto: "Locação de impressoras e copiadoras multifuncionais" },
  { nome: "Empresa Contratada 16 Ltda.", objeto: "Fornecimento de água mineral e bebedouros" },
  { nome: "Empresa Contratada 17 Ltda.", objeto: "Manutenção de sistemas prediais e hidráulicos" },
  { nome: "Empresa Contratada 18 Ltda.", objeto: "Consultoria especializada em gestão pública" },
  { nome: "Empresa Contratada 19 Ltda.", objeto: "Serviços de telefonia fixa, móvel e dados" },
  { nome: "Empresa Contratada 20 Ltda.", objeto: "Fornecimento de material de expediente" },
];

const FISCAIS = [
  "Fiscal 01",
  "Fiscal 02",
  "Fiscal 03",
  "Fiscal 04",
  "Fiscal 05",
  "Fiscal 06",
  "Fiscal 07",
  "Fiscal 08",
  "Fiscal 09",
  "Fiscal 10",
  "Fiscal 11",
  "Fiscal 12",
];

const TYPICAL_DURATION: Record<FlowStageId, number> = {
  planejamento: 20,
  solicitacao: 8,
  "aguardando-cdo": 10,
  fiscalizacao: 12,
  "area-tecnica": 10,
  juridico: 15,
  assinaturas: 7,
  publicacao: 5,
  "nova-vigencia": 1,
};

function stageResponsavel(stageId: FlowStageId, fiscal: string): string {
  switch (stageId) {
    case "planejamento":
    case "solicitacao":
      return "Coordenação de Contratos";
    case "aguardando-cdo":
      return "CDO — Coordenação de Orçamento";
    case "fiscalizacao":
      return fiscal;
    case "area-tecnica":
      return "Área Técnica Especializada";
    case "juridico":
      return "Procuradoria Jurídica";
    case "assinaturas":
      return "Gabinete da Autoridade Competente";
    case "publicacao":
      return "Núcleo de Comunicação";
    case "nova-vigencia":
      return "Processo concluído";
  }
}

export function buildFluxo(
  currentStageId: FlowStageId,
  rnd: SeededRandom,
  fiscal: string
): FlowStageState[] {
  const currentIdx = stageIndex(currentStageId);
  const isFullyDone = currentStageId === "nova-vigencia";
  const states: FlowStageState[] = new Array(FLOW_STAGES.length);
  let daysAgoCursor = 0;

  for (let idx = FLOW_STAGES.length - 1; idx >= 0; idx--) {
    const stage = FLOW_STAGES[idx];
    const responsavel = stageResponsavel(stage.id, fiscal);

    if (idx > currentIdx) {
      states[idx] = {
        stageId: stage.id,
        status: idx === currentIdx + 1 ? "proxima" : "nao-iniciada",
        diasNaEtapa: 0,
        responsavel,
        ultimaMovimentacao: "",
        percentualConcluido: 0,
      };
      continue;
    }

    if (idx === currentIdx && !isFullyDone) {
      const typical = TYPICAL_DURATION[stage.id];
      const diasNaEtapa = rnd.int(1, Math.round(typical * 1.6));
      const atrasada = diasNaEtapa > typical * 1.4;
      daysAgoCursor = diasNaEtapa;
      states[idx] = {
        stageId: stage.id,
        status: atrasada ? "atrasada" : "andamento",
        diasNaEtapa,
        responsavel,
        ultimaMovimentacao: iso(subDays(HOJE, rnd.int(0, Math.min(3, diasNaEtapa)))),
        percentualConcluido: rnd.int(25, 85),
      };
      continue;
    }

    const typical = TYPICAL_DURATION[stage.id];
    const dias = rnd.int(Math.max(2, Math.round(typical * 0.5)), Math.round(typical * 1.3));
    daysAgoCursor += dias;
    states[idx] = {
      stageId: stage.id,
      status: "concluida",
      diasNaEtapa: dias,
      responsavel,
      ultimaMovimentacao: iso(subDays(HOJE, daysAgoCursor)),
      percentualConcluido: 100,
    };
  }

  return states;
}

export function buildHistorico(fluxo: FlowStageState[], numero: string): HistoricoEvento[] {
  const eventos: HistoricoEvento[] = [];
  const relevantes = fluxo.filter((f) => f.status === "concluida" || f.status === "andamento" || f.status === "atrasada");
  const ordenados = [...relevantes].sort((a, b) => (a.ultimaMovimentacao < b.ultimaMovimentacao ? -1 : 1));

  eventos.push({
    data: ordenados[0]?.ultimaMovimentacao ?? iso(HOJE),
    evento: `Processo de prorrogação do contrato ${numero} aberto`,
    autor: "Coordenação de Contratos",
  });

  for (const estado of ordenados) {
    const stage = FLOW_STAGES.find((s) => s.id === estado.stageId)!;
    eventos.push({
      data: estado.ultimaMovimentacao,
      evento:
        estado.status === "concluida"
          ? `Etapa "${stage.nome}" concluída`
          : estado.status === "atrasada"
          ? `Etapa "${stage.nome}" em andamento — prazo excedido`
          : `Etapa "${stage.nome}" iniciada`,
      autor: estado.responsavel,
    });
  }

  return eventos.sort((a, b) => (a.data < b.data ? 1 : -1));
}

export function buildDocumentos(progresso: number): DocumentoContrato[] {
  // Os documentos de prorrogação são juntados ao processo em sequência: quanto
  // mais avançada a prorrogação, mais itens já entregues.
  const entregues = Math.round(progresso * DOCUMENTOS_PRORROGACAO.length);
  return DOCUMENTOS_PRORROGACAO.map((nome, i) => ({
    nome,
    tipo: "PDF",
    status: i < entregues ? "entregue" : "pendente",
  }));
}

// Órgãos públicos que costumam ser atendidos pelos contratos da unidade.
const ORGAOS_PUBLICOS_POOL = [
  "Órgão Público 01",
  "Órgão Público 02",
  "Órgão Público 03",
  "Órgão Público 04",
  "Órgão Público 05",
  "Órgão Público 06",
  "Órgão Público 07",
  "Órgão Público 08",
];

const EMAIL_PREFIXOS = ["contato", "comercial", "financeiro", "contratos", "atendimento"];

function slugEmpresa(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ltda\.?|s\.?\/?a\.?|\bme\b|\bepp\b|&|\.|,/g, "")
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 22);
}

function buildEmailsEmpresa(nome: string, rnd: SeededRandom): string[] {
  const slug = slugEmpresa(nome) || "empresa";
  const prefixos = rnd.pickMany(EMAIL_PREFIXOS, rnd.int(1, 3));
  // Domínio "example.com" é reservado pela IANA para exemplos — nunca é real.
  return prefixos.map((p) => `${p}@${slug}.example.com`);
}

function buildOrgaosAtendidos(rnd: SeededRandom): string[] {
  return rnd.pickMany(ORGAOS_PUBLICOS_POOL, rnd.int(1, 3));
}

const CHECKLIST_POOL = [
  "Vigência conferida no sistema",
  "Dotação orçamentária confirmada",
  "Fiscal ciente da prorrogação",
  "Empresa notificada formalmente",
  "Documentação fiscal regular",
  "Minuta revisada pela área jurídica",
  "Valores atualizados conforme índice",
];

export function buildChecklist(rnd: SeededRandom, progresso: number): ChecklistItem[] {
  return CHECKLIST_POOL.map((item) => ({ item, concluido: rnd.bool(progresso) }));
}

export function gerarCNPJ(rnd: SeededRandom): string {
  // CNPJ fictício, em formato de exemplo (não corresponde a empresa real).
  const p = () => rnd.int(0, 9);
  return `00.000.000/0001-${p()}${p()}`;
}

export function gerarSEI(rnd: SeededRandom, ano: number): string {
  const bloco = () => rnd.int(0, 9);
  return `00000.${bloco()}${bloco()}${bloco()}${bloco()}${bloco()}${bloco()}/${ano}-${rnd.int(10, 99)}`;
}

interface ContractSeed {
  numero: string;
  ano: number;
  empresaIdx: number;
  etapaAtualId: FlowStageId;
  diasRestantes: number;
  temPlanoDeAcao?: boolean;
  diasAntecedenciaConclusao?: number;
}

const DIAS_POR_ETAPA: Record<Exclude<FlowStageId, "nova-vigencia">, number[]> = {
  planejamento: [265, 240, 210, 195, 178, 160, 150, 135],
  solicitacao: [205, 175, 150, 82],
  "aguardando-cdo": [139, 142, 128],
  fiscalizacao: [230, 165, 78, 68, 52],
  "area-tecnica": [150, 125, 72],
  juridico: [80, 47],
  assinaturas: [43],
  publicacao: [132, 126, 84, 67],
};

function contractStatusFromStage(stageId: FlowStageId): ContractStatus {
  if (stageId === "nova-vigencia") return "vigente";
  if (stageId === "assinaturas") return "aguardando-assinatura";
  return "em-prorrogacao";
}

function buildContract(seed: ContractSeed, rnd: SeededRandom, index: number): Contract {
  const empresaInfo = EMPRESAS[seed.empresaIdx % EMPRESAS.length];
  const fiscal = rnd.pick(FISCAIS);
  const fiscalSubstituto = rnd.bool(0.4) ? rnd.pick(FISCAIS.filter((f) => f !== fiscal)) : undefined;
  const fluxo = buildFluxo(seed.etapaAtualId, rnd, fiscal);
  const concluido = seed.etapaAtualId === "nova-vigencia";
  const progresso = concluido ? 1 : (stageIndex(seed.etapaAtualId) + 1) / FLOW_STAGES.length;

  const dataTermino = concluido
    ? iso(addDays(HOJE, seed.diasRestantes))
    : iso(addDays(HOJE, seed.diasRestantes));
  const dataInicio = iso(subDays(new Date(dataTermino), 365 * rnd.int(1, 4) + rnd.int(0, 30)));

  const estadoAtual = fluxo.find((f) => f.stageId === seed.etapaAtualId);
  const stageMeta = FLOW_STAGES.find((s) => s.id === seed.etapaAtualId)!;

  return {
    id: `ct-${index}`,
    numero: seed.numero,
    empresa: empresaInfo.nome,
    cnpj: gerarCNPJ(rnd),
    objeto: empresaInfo.objeto,
    fiscal,
    fiscalSubstituto,
    valor: rnd.int(85, 4200) * 1000,
    dataInicio,
    dataTermino,
    processoSEI: gerarSEI(rnd, seed.ano),
    status: contractStatusFromStage(seed.etapaAtualId),
    ultimaMovimentacao: estadoAtual?.ultimaMovimentacao || iso(HOJE),
    ultimaMovimentacaoDescricao: concluido
      ? "Termo Aditivo publicado e nova vigência iniciada"
      : `Etapa "${stageMeta.nome}" em andamento`,
    responsavelAtual: estadoAtual?.responsavel ?? "Coordenação de Contratos",
    etapaAtualId: seed.etapaAtualId,
    fluxo,
    historico: buildHistorico(fluxo, seed.numero),
    documentos: buildDocumentos(progresso),
    checklist: buildChecklist(rnd, progresso),
    anoExercicio: seed.ano,
    temPlanoDeAcao: seed.temPlanoDeAcao ?? true,
    observacaoStatus: concluido ? "TA concluído com folga" : stageMeta.nome,
    diasAntecedenciaConclusao: seed.diasAntecedenciaConclusao,
    emailsEmpresa: buildEmailsEmpresa(empresaInfo.nome, rnd),
    orgaosAtendidos: buildOrgaosAtendidos(rnd),
  };
}

function gerarContratos(rnd: SeededRandom): Contract[] {
  const seeds: ContractSeed[] = [];
  let seq = 25;
  let empresaCursor = 0;

  seeds.push({
    numero: "29/2025",
    ano: 2025,
    empresaIdx: 0,
    etapaAtualId: "aguardando-cdo",
    diasRestantes: 139,
  });
  seeds.push({
    numero: "30/2025",
    ano: 2025,
    empresaIdx: 0,
    etapaAtualId: "aguardando-cdo",
    diasRestantes: 142,
  });

  (Object.keys(DIAS_POR_ETAPA) as Exclude<FlowStageId, "nova-vigencia">[]).forEach((stageId) => {
    const valores = DIAS_POR_ETAPA[stageId];
    valores.forEach((dias) => {
      if (stageId === "aguardando-cdo" && dias === 139) return;
      if (stageId === "aguardando-cdo" && dias === 142) return;
      seq += 1;
      empresaCursor += 1;
      seeds.push({
        numero: `${seq}/${dias > 200 ? 2025 : 2026}`,
        ano: dias > 200 ? 2025 : 2026,
        empresaIdx: empresaCursor,
        etapaAtualId: stageId,
        diasRestantes: dias,
        temPlanoDeAcao: dias < 60 ? true : rnd.bool(0.85),
      });
    });
  });

  for (let i = 0; i < 28; i++) {
    seq += 1;
    empresaCursor += 1;
    const roll = rnd.next();
    const antecedencia = roll < 0.72 ? rnd.int(90, 120) : roll < 0.86 ? rnd.int(48, 89) : rnd.int(121, 175);
    const ano = 2022 + (i % 4);
    seeds.push({
      numero: `${seq}/${ano}`,
      ano,
      empresaIdx: empresaCursor,
      etapaAtualId: "nova-vigencia",
      diasRestantes: rnd.int(210, 650),
      diasAntecedenciaConclusao: antecedencia,
    });
  }

  return seeds.map((seed, index) => buildContract(seed, rnd, index + 1));
}

const PENALTY_DESCRICOES: Record<PenaltyCategory, string> = {
  "aguardando-pagamento": "Aguardando confirmação de pagamento da multa aplicada.",
  "fazer-nt": "Pendente elaboração de Nota Técnica para instrução do processo.",
  "em-defesa": "Empresa apresentou defesa prévia, aguardando análise da comissão.",
  "aguardando-justificativa": "Aguardando justificativa formal da contratada.",
  "em-espera": "Processo suspenso aguardando diligência complementar.",
  "recem-aberto": "Processo administrativo sancionador recém instaurado.",
};

function gerarPenalidades(rnd: SeededRandom, contratos: Contract[]): Penalty[] {
  const distribuicaoAndamento: [PenaltyCategory, number][] = [
    ["aguardando-pagamento", 7],
    ["fazer-nt", 4],
    ["em-defesa", 6],
    ["aguardando-justificativa", 5],
    ["em-espera", 3],
    ["recem-aberto", 4],
  ];
  const distribuicaoFinalizado: [PenaltyCategory, number][] = [
    ["aguardando-pagamento", 3],
    ["fazer-nt", 2],
    ["em-defesa", 3],
    ["aguardando-justificativa", 2],
    ["em-espera", 2],
    ["recem-aberto", 3],
  ];

  const penalidades: Penalty[] = [];
  let counter = 1;

  const criar = (categoria: PenaltyCategory, status: "andamento" | "finalizado") => {
    const contrato = rnd.pick(contratos);
    const abertura = subDays(HOJE, rnd.int(5, 220));
    const finalizacao = status === "finalizado" ? addDays(abertura, rnd.int(10, 90)) : undefined;

    penalidades.push({
      id: `pen-${counter}`,
      contratoId: contrato.id,
      numeroProcesso: gerarSEI(rnd, abertura.getFullYear()),
      empresa: contrato.empresa,
      categoria,
      status,
      dataAbertura: iso(abertura),
      dataFinalizacao: finalizacao ? iso(finalizacao) : undefined,
      valor: rnd.int(3, 180) * 1000,
      descricao: PENALTY_DESCRICOES[categoria],
    });
    counter += 1;
  };

  distribuicaoAndamento.forEach(([categoria, count]) => {
    for (let i = 0; i < count; i++) criar(categoria, "andamento");
  });
  distribuicaoFinalizado.forEach(([categoria, count]) => {
    for (let i = 0; i < count; i++) criar(categoria, "finalizado");
  });

  return penalidades;
}

const EVENTOS_INSTITUCIONAIS = [
  { titulo: "Reunião do Comitê de Contratos", offset: 2 },
  { titulo: "Auditoria da CGU", offset: 9 },
  { titulo: "Treinamento SEI para fiscais", offset: -3 },
  { titulo: "Reunião de alinhamento jurídico", offset: 14 },
  { titulo: "Apresentação de indicadores à direção", offset: 21 },
  { titulo: "Capacitação em Gestão de Contratos", offset: -11 },
  { titulo: "Visita técnica — auditoria interna", offset: 27 },
];

function gerarEventosCalendario(contratos: Contract[], penalidades: Penalty[]): CalendarEvent[] {
  const eventos: CalendarEvent[] = [];

  contratos.forEach((c) => {
    eventos.push({
      id: `venc-${c.id}`,
      data: c.dataTermino,
      tipo: "vencimento",
      titulo: `Vencimento — Contrato ${c.numero}`,
      contratoId: c.id,
      descricao: c.empresa,
    });

    if (!isConcluido(c)) {
      const primeira = c.historico[c.historico.length - 1];
      if (primeira) {
        eventos.push({
          id: `pror-abertura-${c.id}`,
          data: primeira.data,
          tipo: "prorrogacao",
          titulo: `Abertura de prorrogação — Contrato ${c.numero}`,
          contratoId: c.id,
          descricao: c.empresa,
        });
      }
    } else {
      const publicacao = c.fluxo.find((f) => f.stageId === "publicacao");
      if (publicacao?.ultimaMovimentacao) {
        eventos.push({
          id: `pror-pub-${c.id}`,
          data: publicacao.ultimaMovimentacao,
          tipo: "prorrogacao",
          titulo: `Termo Aditivo publicado — Contrato ${c.numero}`,
          contratoId: c.id,
          descricao: c.empresa,
        });
      }
    }
  });

  penalidades.forEach((p) => {
    eventos.push({
      id: `pen-abertura-${p.id}`,
      data: p.dataAbertura,
      tipo: "penalidade",
      titulo: `Abertura de processo sancionador — ${p.empresa}`,
      descricao: p.numeroProcesso,
    });
    if (p.dataFinalizacao) {
      eventos.push({
        id: `pen-fim-${p.id}`,
        data: p.dataFinalizacao,
        tipo: "penalidade",
        titulo: `Encerramento de processo — ${p.empresa}`,
        descricao: p.numeroProcesso,
      });
    }
  });

  EVENTOS_INSTITUCIONAIS.forEach((e, i) => {
    eventos.push({
      id: `evt-${i}`,
      data: iso(addDays(HOJE, e.offset)),
      tipo: "evento",
      titulo: e.titulo,
    });
  });

  return eventos.sort((a, b) => (a.data < b.data ? -1 : 1));
}

export interface MockDataset {
  contratos: Contract[];
  penalidades: Penalty[];
  eventos: CalendarEvent[];
  streakDesde: string;
  ultimaAtualizacao: string;
}

export function gerarDatasetMock(seed = 20260716): MockDataset {
  const rnd = new SeededRandom(seed);
  const contratos = gerarContratos(rnd);
  const penalidades = gerarPenalidades(rnd, contratos);
  const eventos = gerarEventosCalendario(contratos, penalidades);

  return {
    contratos,
    penalidades,
    eventos,
    streakDesde: STREAK_DESDE,
    ultimaAtualizacao: iso(HOJE),
  };
}
