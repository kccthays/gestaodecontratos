import { isSameMonth, parseISO } from "date-fns";
import type { Contract, Penalty } from "@/types";
import { agruparPorFaixa, calcularStreak, diasRestantes, formatarMoeda, isConcluido } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";

export interface IAContext {
  contratos: Contract[];
  penalidades: Penalty[];
  streakDesde: string;
}

export interface IAResposta {
  texto: string;
  contratos?: Contract[];
}

function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

function listarContratos(contratos: Contract[], max = 6): string {
  if (contratos.length === 0) return "";
  return contratos
    .slice(0, max)
    .map((c) => `• Contrato ${c.numero} — ${c.empresa} (${diasRestantes(c.dataTermino, HOJE)} dias)`)
    .join("\n");
}

export function responderPergunta(perguntaBruta: string, ctx: IAContext): IAResposta {
  const p = normalizar(perguntaBruta);
  const hoje = HOJE;

  if (p.includes("vence") && (p.includes("mes") || p.includes("mês"))) {
    const vencem = ctx.contratos.filter((c) => isSameMonth(parseISO(c.dataTermino), hoje));
    if (vencem.length === 0) {
      return { texto: "Nenhum contrato tem vencimento previsto para este mês." };
    }
    return {
      texto: `${vencem.length} contrato${vencem.length > 1 ? "s" : ""} vence${vencem.length > 1 ? "m" : ""} este mês:\n\n${listarContratos(vencem)}`,
      contratos: vencem,
    };
  }

  if (p.includes("zona critica") || p.includes("zona crítica") || (p.includes("critic") && p.includes("contrat"))) {
    const grupos = agruparPorFaixa(ctx.contratos, hoje);
    const criticos = grupos["zona-critica"];
    if (criticos.length === 0) {
      return { texto: "🎉 Nenhum contrato encontra-se em Zona Crítica no momento." };
    }
    return {
      texto: `${criticos.length} contrato${criticos.length > 1 ? "s" : ""} em Zona Crítica (menos de 60 dias para o vencimento):\n\n${listarContratos(criticos)}`,
      contratos: criticos,
    };
  }

  if (p.includes("penalidade") && (p.includes("quant") || p.includes("existe") || p.includes("total"))) {
    const total = ctx.penalidades.length;
    const andamento = ctx.penalidades.filter((x) => x.status === "andamento").length;
    const finalizados = ctx.penalidades.filter((x) => x.status === "finalizado").length;
    return {
      texto: `Existem ${total} processos de penalidade registrados: ${andamento} em andamento e ${finalizados} finalizados.`,
    };
  }

  if (p.includes("cdo")) {
    const aguardando = ctx.contratos.filter((c) => c.etapaAtualId === "aguardando-cdo");
    if (aguardando.length === 0) {
      return { texto: "Nenhum contrato está aguardando manifestação da CDO no momento." };
    }
    return {
      texto: `${aguardando.length} contrato${aguardando.length > 1 ? "s" : ""} aguarda${aguardando.length > 1 ? "m" : ""} CDO:\n\n${listarContratos(aguardando)}`,
      contratos: aguardando,
    };
  }

  if (p.includes("tempo") && p.includes("zona critica") === false && (p.includes("sem entrar") || p.includes("streak") || p.includes("consecutiv"))) {
    const streak = calcularStreak(ctx.contratos, ctx.streakDesde, hoje);
    if (!streak.disponivel) return { texto: "Aguardando histórico suficiente para calcular esse indicador." };
    if (streak.contratosAtivosSemPlano > 0) {
      return {
        texto: `Atualmente há ${streak.contratosAtivosSemPlano} contrato(s) em Zona Crítica sem plano de ação — o contador foi zerado.`,
      };
    }
    return {
      texto: `Estamos há ${streak.dias} dias consecutivos sem nenhum contrato entrar na Zona Crítica sem plano de ação.`,
    };
  }

  if (p.includes("percentual") && p.includes("prorrog")) {
    const concluidos = ctx.contratos.filter(isConcluido).length;
    const percentual = ctx.contratos.length > 0 ? Math.round((concluidos / ctx.contratos.length) * 100) : 0;
    return {
      texto: `${percentual}% das prorrogações foram concluídas (${concluidos} de ${ctx.contratos.length} contratos monitorados).`,
    };
  }

  if (p.includes("gargalo") || p.includes("travad")) {
    return {
      texto: 'Acesse o "Mapa de Fluxo" e clique em "Identificar Gargalos" para uma análise completa dos pontos de retenção do processo.',
    };
  }

  if (p.includes("valor") && p.includes("total")) {
    const total = ctx.contratos.reduce((acc, c) => acc + c.valor, 0);
    return { texto: `O valor total monitorado é de ${formatarMoeda(total)} em ${ctx.contratos.length} contratos.` };
  }

  return {
    texto:
      "Posso ajudar com perguntas como:\n\n• Quais contratos vencem este mês?\n• Quais estão em Zona Crítica?\n• Quantos processos de penalidade existem?\n• Quais contratos aguardam CDO?\n• Quanto tempo estamos sem entrar na Zona Crítica?\n• Qual o percentual de prorrogações concluídas?",
  };
}

export const PERGUNTAS_SUGERIDAS = [
  "Quais contratos vencem este mês?",
  "Quais estão em Zona Crítica?",
  "Quantos processos de penalidade existem?",
  "Quais contratos aguardam CDO?",
  "Quanto tempo estamos sem entrar na Zona Crítica?",
  "Qual o percentual de prorrogações concluídas?",
];
