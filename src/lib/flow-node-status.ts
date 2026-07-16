import type { Contract, FlowStageId } from "@/types";
import { FLOW_STAGES } from "@/lib/flow-stages";

export type NodeStatus = "concluida" | "andamento" | "proxima" | "atrasada" | "nao-iniciada";

export interface NodeAggregate {
  stageId: FlowStageId;
  status: NodeStatus;
  quantidadeAtual: number;
  tempoMedioDias: number;
  ultimaMovimentacao: string | null;
  percentualConcluido: number;
  responsavel: string;
}

const GENERIC_RESPONSAVEL: Record<FlowStageId, string> = {
  planejamento: "Coordenação de Contratos",
  solicitacao: "Coordenação de Contratos",
  "aguardando-cdo": "CDO — Coordenação de Orçamento",
  fiscalizacao: "Fiscal do contrato",
  "area-tecnica": "Área Técnica Especializada",
  juridico: "Procuradoria Jurídica",
  assinaturas: "Gabinete da Superintendência",
  publicacao: "Núcleo de Comunicação",
  "nova-vigencia": "Concluído",
};

export const NODE_STATUS_META: Record<NodeStatus, { label: string; dot: string; ring: string; bg: string; text: string }> = {
  concluida: { label: "Concluída", dot: "bg-success", ring: "ring-success/40", bg: "bg-success-soft", text: "text-success" },
  andamento: { label: "Em andamento", dot: "bg-info", ring: "ring-info/40", bg: "bg-info-soft", text: "text-info" },
  proxima: { label: "Próxima atividade", dot: "bg-warning", ring: "ring-warning/40", bg: "bg-warning-soft", text: "text-warning" },
  atrasada: { label: "Parada além do prazo", dot: "bg-danger", ring: "ring-danger/40", bg: "bg-danger-soft", text: "text-danger" },
  "nao-iniciada": {
    label: "Ainda não iniciada",
    dot: "bg-slate-300 dark:bg-slate-600",
    ring: "ring-slate-300/40",
    bg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-500 dark:text-slate-400",
  },
};

export function calcularAgregadoEtapas(contracts: Contract[]): NodeAggregate[] {
  return FLOW_STAGES.map((stage) => {
    const estados = contracts.map((c) => c.fluxo.find((f) => f.stageId === stage.id)).filter((f): f is NonNullable<typeof f> => Boolean(f));

    const atrasadas = estados.filter((e) => e.status === "atrasada");
    const atuais = estados.filter((e) => e.status === "andamento" || e.status === "atrasada");
    const proximas = estados.filter((e) => e.status === "proxima");
    const concluidas = estados.filter((e) => e.status === "concluida");

    let status: NodeStatus;
    if (atuais.length > 0 && atrasadas.length / atuais.length >= 0.4) status = "atrasada";
    else if (atuais.length > 0) status = "andamento";
    else if (proximas.length > 0) status = "proxima";
    else if (concluidas.length > 0) status = "concluida";
    else status = "nao-iniciada";

    const baseTempo = atuais.length > 0 ? atuais : concluidas;
    const tempoMedioDias =
      baseTempo.length > 0 ? Math.round(baseTempo.reduce((acc, e) => acc + e.diasNaEtapa, 0) / baseTempo.length) : 0;

    const movimentacoes = estados
      .map((e) => e.ultimaMovimentacao)
      .filter(Boolean)
      .sort()
      .reverse();

    const responsavel = atuais[0]?.responsavel ?? GENERIC_RESPONSAVEL[stage.id];
    const percentualConcluido = contracts.length > 0 ? Math.round((concluidas.length / contracts.length) * 100) : 0;

    return {
      stageId: stage.id,
      status,
      quantidadeAtual: atuais.length,
      tempoMedioDias,
      ultimaMovimentacao: movimentacoes[0] ?? null,
      percentualConcluido,
      responsavel,
    };
  });
}
