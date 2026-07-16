import type { Contract, Penalty } from "@/types";
import { PENALTY_CATEGORY_META } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { identificarGargalos } from "@/lib/flow-calculations";

export interface QuadroGargaloItem {
  id: string;
  origem: "penalidade" | "contrato";
  titulo: string;
  subtitulo: string;
  quantidade: number;
  contratos: Contract[];
  penalidades: Penalty[];
}

export function montarQuadroGargalos(contratos: Contract[], penalidades: Penalty[]): QuadroGargaloItem[] {
  const porCategoria = new Map<string, Penalty[]>();
  penalidades
    .filter((p) => p.status === "andamento")
    .forEach((p) => {
      const arr = porCategoria.get(p.categoria) ?? [];
      arr.push(p);
      porCategoria.set(p.categoria, arr);
    });

  const itensPenalidade: QuadroGargaloItem[] = Array.from(porCategoria.entries())
    .map(([categoria, itens]) => ({
      id: `pen-${categoria}`,
      origem: "penalidade" as const,
      titulo: "Penalidades",
      subtitulo: PENALTY_CATEGORY_META[categoria as keyof typeof PENALTY_CATEGORY_META].label,
      quantidade: itens.length,
      contratos: [],
      penalidades: itens,
    }))
    .filter((i) => i.quantidade > 0);

  const gargalosContrato = identificarGargalos(contratos).filter((g) => g.quantidade > 0);
  const itensContrato: QuadroGargaloItem[] = gargalosContrato.map((g) => ({
    id: `ct-${g.stageId}`,
    origem: "contrato" as const,
    titulo: "Contratos",
    subtitulo: FLOW_STAGE_MAP[g.stageId].nome,
    quantidade: g.quantidade,
    contratos: contratos.filter((c) => c.etapaAtualId === g.stageId),
    penalidades: [],
  }));

  return [...itensPenalidade, ...itensContrato].sort((a, b) => b.quantidade - a.quantidade);
}
