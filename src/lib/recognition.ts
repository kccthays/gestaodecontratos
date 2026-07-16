import { isSameMonth, parseISO } from "date-fns";
import type { Contract, Penalty } from "@/types";
import { isConcluido } from "@/lib/calculations";

export interface ReconhecimentoStats {
  processosRetornados: number | null;
  impactoDoMes: number | null;
  processosConcluidos: number | null;
  economiaGerada: number | null;
  tempoMedioConclusaoDias: number | null;
  percentualCumprimento: number | null;
}

function tempoTotalFluxo(contract: Contract): number {
  return contract.fluxo.reduce((acc, f) => acc + f.diasNaEtapa, 0);
}

export function calcularReconhecimento(
  contracts: Contract[],
  _penalties: Penalty[],
  hoje: Date = new Date()
): ReconhecimentoStats {
  if (contracts.length === 0) {
    return {
      processosRetornados: null,
      impactoDoMes: null,
      processosConcluidos: null,
      economiaGerada: null,
      tempoMedioConclusaoDias: null,
      percentualCumprimento: null,
    };
  }

  const concluidos = contracts.filter(isConcluido);

  const impactoDoMes = concluidos.filter((c) => {
    const publicacao = c.fluxo.find((f) => f.stageId === "publicacao");
    if (!publicacao?.ultimaMovimentacao) return false;
    return isSameMonth(parseISO(publicacao.ultimaMovimentacao), hoje);
  }).length;

  const tempoMedioConclusaoDias =
    concluidos.length > 0
      ? Math.round(concluidos.reduce((acc, c) => acc + tempoTotalFluxo(c), 0) / concluidos.length)
      : null;

  const percentualCumprimento = Math.round((concluidos.length / contracts.length) * 100);

  return {
    processosRetornados: 0,
    impactoDoMes,
    processosConcluidos: concluidos.length,
    economiaGerada: null,
    tempoMedioConclusaoDias,
    percentualCumprimento,
  };
}

export function indicadoresRapidosPenalidades(penalties: Penalty[]) {
  const finalizados = penalties.filter((p) => p.status === "finalizado");
  const andamento = penalties.filter((p) => p.status === "andamento");

  const pagamentosInstruidos = penalties.filter(
    (p) => p.categoria === "aguardando-pagamento" && p.status === "finalizado"
  ).length;

  const atosOficiaisPublicados = finalizados.length;

  const documentosPendentes = andamento.length * 0 + andamento.filter((p) => p.categoria !== "recem-aberto").length;

  const temposResposta = finalizados
    .filter((p) => p.dataFinalizacao)
    .map((p) => {
      const abertura = parseISO(p.dataAbertura);
      const fim = parseISO(p.dataFinalizacao!);
      return Math.max(0, Math.round((fim.getTime() - abertura.getTime()) / (1000 * 60 * 60 * 24)));
    });

  const tempoMedioResposta =
    temposResposta.length > 0
      ? Math.round(temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length)
      : null;

  return { pagamentosInstruidos, atosOficiaisPublicados, documentosPendentes, tempoMedioResposta };
}
