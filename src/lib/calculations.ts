import { differenceInCalendarDays, parseISO } from "date-fns";
import type { Contract, FaixaAntecedencia, Penalty, PenaltyCategory } from "@/types";

export function diasRestantes(dataTermino: string, hoje: Date = new Date()): number {
  return differenceInCalendarDays(parseISO(dataTermino), hoje);
}

export function classificarFaixa(contract: Contract, hoje: Date = new Date()): FaixaAntecedencia {
  const dias = diasRestantes(contract.dataTermino, hoje);
  if (dias > 120) return "planejamento";
  if (dias >= 90) return "meta-batida";
  if (dias >= 60) return "atencao";
  return "zona-critica";
}

export const FAIXA_META: Record<
  FaixaAntecedencia,
  { label: string; corClasse: string; corSuave: string; corTexto: string; descricao: string }
> = {
  planejamento: {
    label: "Planejamento",
    corClasse: "bg-info",
    corSuave: "bg-info-soft",
    corTexto: "text-info",
    descricao: "Contratos com mais de 120 dias para o vencimento",
  },
  "meta-batida": {
    label: "Meta Batida",
    corClasse: "bg-success",
    corSuave: "bg-success-soft",
    corTexto: "text-success",
    descricao: "Contratos concluídos ou em dia, entre 90 e 120 dias",
  },
  atencao: {
    label: "Atenção",
    corClasse: "bg-warning",
    corSuave: "bg-warning-soft",
    corTexto: "text-warning",
    descricao: "Contratos entre 60 e 90 dias para o vencimento",
  },
  "zona-critica": {
    label: "Zona Crítica",
    corClasse: "bg-danger",
    corSuave: "bg-danger-soft",
    corTexto: "text-danger",
    descricao: "Contratos com menos de 60 dias para o vencimento",
  },
};

export function isConcluido(contract: Contract): boolean {
  return contract.etapaAtualId === "nova-vigencia";
}

export function calcularStreak(contracts: Contract[], streakDesde: string | null, hoje: Date = new Date()) {
  const contratosCriticosSemPlano = contracts.filter(
    (c) => !isConcluido(c) && classificarFaixa(c, hoje) === "zona-critica" && !c.temPlanoDeAcao
  );

  if (!streakDesde) {
    return {
      dias: 0,
      desde: null,
      disponivel: false,
      contratosAtivosSemPlano: contratosCriticosSemPlano.length,
    };
  }

  const dias = contratosCriticosSemPlano.length > 0 ? 0 : differenceInCalendarDays(hoje, parseISO(streakDesde));

  return {
    dias: Math.max(dias, 0),
    desde: streakDesde,
    disponivel: true,
    contratosAtivosSemPlano: contratosCriticosSemPlano.length,
  };
}

export function agruparPorFaixa(contracts: Contract[], hoje: Date = new Date()) {
  const grupos: Record<FaixaAntecedencia, Contract[]> = {
    planejamento: [],
    "meta-batida": [],
    atencao: [],
    "zona-critica": [],
  };
  for (const c of contracts) {
    if (isConcluido(c)) {
      const antecedencia = c.diasAntecedenciaConclusao;
      if (antecedencia != null && antecedencia >= 90 && antecedencia <= 120) {
        grupos["meta-batida"].push(c);
      }
      continue;
    }
    grupos[classificarFaixa(c, hoje)].push(c);
  }
  return grupos;
}

export const PENALTY_CATEGORY_META: Record<
  PenaltyCategory,
  { label: string; ordem: number }
> = {
  "aguardando-pagamento": { label: "Aguardando pagamento", ordem: 1 },
  "fazer-nt": { label: "Fazer NT", ordem: 2 },
  "em-defesa": { label: "Em fase de defesa", ordem: 3 },
  "aguardando-justificativa": { label: "Aguardando justificativa", ordem: 4 },
  "em-espera": { label: "Processo em espera", ordem: 5 },
  "recem-aberto": { label: "Recém aberto", ordem: 6 },
};

export function estatisticasPenalidades(penalties: Penalty[]) {
  const total = penalties.length;
  const andamento = penalties.filter((p) => p.status === "andamento").length;
  const finalizados = penalties.filter((p) => p.status === "finalizado").length;

  const porCategoria = (Object.keys(PENALTY_CATEGORY_META) as PenaltyCategory[])
    .map((categoria) => {
      const items = penalties.filter((p) => p.categoria === categoria && p.status === "andamento");
      return {
        categoria,
        label: PENALTY_CATEGORY_META[categoria].label,
        quantidade: items.length,
        percentual: andamento > 0 ? Math.round((items.length / andamento) * 100) : 0,
      };
    })
    .sort((a, b) => PENALTY_CATEGORY_META[a.categoria].ordem - PENALTY_CATEGORY_META[b.categoria].ordem);

  return { total, andamento, finalizados, porCategoria };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);
}

export function formatarData(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(
    parseISO(data)
  );
}

export function formatarDataLonga(data: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric" }).format(
    parseISO(data)
  );
}

export function iniciais(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}
