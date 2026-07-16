import type { Contract, FlowStageId } from "@/types";
import { FLOW_STAGES, FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { diasRestantes, isConcluido } from "@/lib/calculations";

export interface StageOverview {
  stageId: FlowStageId;
  nome: string;
  quantidade: number;
  contratos: Contract[];
}

export function visaoGeralFluxo(contracts: Contract[]): StageOverview[] {
  return FLOW_STAGES.map((stage) => {
    const contratos = contracts.filter((c) => c.etapaAtualId === stage.id);
    return {
      stageId: stage.id,
      nome: stage.id === "nova-vigencia" ? "Concluídos" : stage.nome,
      quantidade: contratos.length,
      contratos,
    };
  });
}

export interface GargaloEtapa {
  stageId: FlowStageId;
  nome: string;
  quantidade: number;
  tempoMedioDias: number;
  contratoMaisAntigo: Contract | null;
}

export function identificarGargalos(contracts: Contract[]): GargaloEtapa[] {
  const pendentes = contracts.filter((c) => !isConcluido(c));

  return FLOW_STAGES.filter((s) => s.id !== "nova-vigencia")
    .map((stage) => {
      const nesta = pendentes.filter((c) => c.etapaAtualId === stage.id);
      const tempoMedio =
        nesta.length > 0
          ? Math.round(
              nesta.reduce((acc, c) => {
                const estado = c.fluxo.find((f) => f.stageId === stage.id);
                return acc + (estado?.diasNaEtapa ?? 0);
              }, 0) / nesta.length
            )
          : 0;

      const maisAntigo = nesta.reduce<Contract | null>((maior, atual) => {
        const estadoAtual = atual.fluxo.find((f) => f.stageId === stage.id);
        const estadoMaior = maior?.fluxo.find((f) => f.stageId === stage.id);
        if (!maior) return atual;
        return (estadoAtual?.diasNaEtapa ?? 0) > (estadoMaior?.diasNaEtapa ?? 0) ? atual : maior;
      }, null);

      return {
        stageId: stage.id,
        nome: stage.nome,
        quantidade: nesta.length,
        tempoMedioDias: tempoMedio,
        contratoMaisAntigo: maisAntigo,
      };
    })
    .sort((a, b) => b.quantidade - a.quantidade);
}

export function contratosParadosMaisTempo(contracts: Contract[], limite = 5): Contract[] {
  return contracts
    .filter((c) => !isConcluido(c))
    .map((c) => {
      const estado = c.fluxo.find((f) => f.stageId === c.etapaAtualId);
      return { contrato: c, dias: estado?.diasNaEtapa ?? 0 };
    })
    .sort((a, b) => b.dias - a.dias)
    .slice(0, limite)
    .map((x) => x.contrato);
}

export function contratosEmRiscoProximos30Dias(contracts: Contract[]): Contract[] {
  return contracts
    .filter((c) => !isConcluido(c))
    .filter((c) => {
      const dias = diasRestantes(c.dataTermino);
      return dias <= 90 && dias >= 0;
    })
    .sort((a, b) => diasRestantes(a.dataTermino) - diasRestantes(b.dataTermino));
}

export function tempoMedioGeralPorEtapa(contracts: Contract[]) {
  return FLOW_STAGES.filter((s) => s.id !== "nova-vigencia").map((stage) => {
    const estados = contracts
      .map((c) => c.fluxo.find((f) => f.stageId === stage.id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f) && f!.status !== "nao-iniciada");

    const media =
      estados.length > 0
        ? Math.round(estados.reduce((acc, e) => acc + e.diasNaEtapa, 0) / estados.length)
        : 0;

    return { stageId: stage.id, nome: stage.nomeCurto, tempoMedioDias: media };
  });
}

export function sugerirPrioridades(contracts: Contract[], limite = 5) {
  const pendentes = contracts.filter((c) => !isConcluido(c));

  const pontuados = pendentes.map((c) => {
    const dias = diasRestantes(c.dataTermino);
    const estado = c.fluxo.find((f) => f.stageId === c.etapaAtualId);
    const diasParado = estado?.diasNaEtapa ?? 0;
    const atrasado = estado?.status === "atrasada" ? 40 : 0;
    const urgenciaPrazo = Math.max(0, 150 - dias);
    const pontuacao = urgenciaPrazo + diasParado * 1.5 + atrasado;
    return { contrato: c, pontuacao, dias, diasParado };
  });

  return pontuados.sort((a, b) => b.pontuacao - a.pontuacao).slice(0, limite);
}

export function gerarAnaliseIA(contracts: Contract[]): string {
  const gargalos = identificarGargalos(contracts);
  const principal = gargalos[0];

  if (!principal || principal.quantidade === 0) {
    return "Nenhum gargalo relevante identificado no momento. Todos os contratos em prorrogação estão fluindo dentro do tempo médio esperado entre as etapas.";
  }

  const emRisco = contratosEmRiscoProximos30Dias(contracts).filter((c) => diasRestantes(c.dataTermino) <= 30);
  const prioridades = sugerirPrioridades(contracts, 2);
  const nomesPrioridade = prioridades.map((p) => p.contrato.numero).join(" e ");
  const stageLabel = FLOW_STAGE_MAP[principal.stageId].nome;

  return `Atualmente existem ${principal.quantidade} contrato${principal.quantidade > 1 ? "s" : ""} em "${stageLabel}", concentrando o principal gargalo do setor. O tempo médio nessa etapa é de ${principal.tempoMedioDias} dias. ${
    emRisco.length > 0
      ? `Há ${emRisco.length} contrato${emRisco.length > 1 ? "s" : ""} que pode${emRisco.length > 1 ? "m" : ""} entrar em Zona Crítica nos próximos 30 dias. `
      : ""
  }${nomesPrioridade ? `Recomenda-se priorizar os contratos ${nomesPrioridade} para manter o indicador de contratos em Zona Crítica sob controle.` : ""}`;
}
