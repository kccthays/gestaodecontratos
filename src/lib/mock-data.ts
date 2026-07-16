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

export const HOJE = new Date(2026, 6, 16);
export const STREAK_DESDE = format(subDays(HOJE, 47), "yyyy-MM-dd");

const iso = (d: Date) => format(d, "yyyy-MM-dd");

const EMPRESAS: { nome: string; objeto: string }[] = [
  { nome: "THF Elevadores Ltda.", objeto: "Manutenção preventiva e corretiva de elevadores e plataformas" },
  { nome: "Serviços Gerais Alfa Ltda.", objeto: "Limpeza, conservação e higienização predial" },
  { nome: "Vigilância Total Segurança Patrimonial Ltda.", objeto: "Vigilância armada e desarmada nas dependências" },
  { nome: "TechNet Soluções em TI Ltda.", objeto: "Suporte técnico e manutenção de infraestrutura de redes" },
  { nome: "Construtora Horizonte Engenharia Ltda.", objeto: "Manutenção predial e pequenas reformas" },
  { nome: "Sabor & Cia Refeições Corporativas Ltda.", objeto: "Fornecimento de refeições coletivas" },
  { nome: "Climatiza Ar Condicionado Ltda.", objeto: "Manutenção de sistemas de climatização e refrigeração" },
  { nome: "GraphTech Gráfica e Editora Ltda.", objeto: "Serviços de impressão, reprografia e editoração" },
  { nome: "Facilities Prime Gestão Predial Ltda.", objeto: "Gestão de facilities, portaria e recepção" },
  { nome: "Rede Postos Combustível Ltda.", objeto: "Fornecimento de combustíveis para frota oficial" },
  { nome: "TransLog Transportes e Logística Ltda.", objeto: "Locação de veículos oficiais com motorista" },
  { nome: "SegurTec Monitoramento Eletrônico Ltda.", objeto: "Monitoramento eletrônico e circuito interno de câmeras" },
  { nome: "Jardim Verde Paisagismo Ltda.", objeto: "Manutenção de áreas verdes e paisagismo" },
  { nome: "DataCenter Brasil Hospedagem Ltda.", objeto: "Hospedagem de dados, nuvem e backup corporativo" },
  { nome: "Cópias & Cia Locação de Equipamentos Ltda.", objeto: "Locação de impressoras e copiadoras multifuncionais" },
  { nome: "Água Pura Distribuidora Ltda.", objeto: "Fornecimento de água mineral e bebedouros" },
  { nome: "Elevar Manutenção Predial Ltda.", objeto: "Manutenção de sistemas prediais e hidráulicos" },
  { nome: "ConsultTec Consultoria em Gestão Ltda.", objeto: "Consultoria especializada em gestão pública" },
  { nome: "Rede Telecom Comunicações Ltda.", objeto: "Serviços de telefonia fixa, móvel e dados" },
  { nome: "Praticidade Suprimentos de Escritório Ltda.", objeto: "Fornecimento de material de expediente" },
];

const FISCAIS = [
  "Marcos Vinícius Andrade",
  "Fernanda Lima Rocha",
  "Carlos Eduardo Santos",
  "Juliana Ferreira Costa",
  "Rodrigo Almeida Souza",
  "Patrícia Gomes Ribeiro",
  "André Luiz Barbosa",
  "Camila Duarte Nunes",
  "Bruno Henrique Martins",
  "Larissa Cardoso Pinto",
  "Eduardo Nogueira Farias",
  "Tatiane Moreira Castro",
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
      return "Gabinete da Superintendência";
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

const DOCUMENTOS_POOL = [
  "Termo de Referência atualizado",
  "Parecer técnico do fiscal",
  "Certidão Negativa de Débitos (CND)",
  "Minuta do Termo Aditivo",
  "Parecer jurídico",
  "Justificativa da prorrogação",
  "Nota técnica orçamentária",
  "Ato de designação do fiscal",
  "Publicação no Diário Oficial",
  "Certidão negativa trabalhista",
];

export function buildDocumentos(rnd: SeededRandom, progresso: number): DocumentoContrato[] {
  const escolhidos = rnd.pickMany(DOCUMENTOS_POOL, rnd.int(5, 7));
  return escolhidos.map((nome) => ({
    nome,
    tipo: "PDF",
    status: rnd.bool(progresso) ? "entregue" : "pendente",
  }));
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
  const p = () => rnd.int(0, 9);
  return `${p()}${p()}.${p()}${p()}${p()}.${p()}${p()}${p()}/0001-${p()}${p()}`;
}

export function gerarSEI(rnd: SeededRandom, ano: number): string {
  const bloco = () => rnd.int(0, 9);
  return `23480.${bloco()}${bloco()}${bloco()}${bloco()}${bloco()}${bloco()}/${ano}-${rnd.int(10, 99)}`;
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
    documentos: buildDocumentos(rnd, progresso),
    checklist: buildChecklist(rnd, progresso),
    anoExercicio: seed.ano,
    temPlanoDeAcao: seed.temPlanoDeAcao ?? true,
    observacaoStatus: concluido ? "TA concluído com folga" : stageMeta.nome,
    diasAntecedenciaConclusao: seed.diasAntecedenciaConclusao,
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
  { titulo: "Apresentação de indicadores à Superintendência", offset: 21 },
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
