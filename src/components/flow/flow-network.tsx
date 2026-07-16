"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { useContractsStore } from "@/store/use-contracts-store";
import { FLOW_STAGES } from "@/lib/flow-stages";
import { classificarFaixa, diasRestantes, FAIXA_META } from "@/lib/calculations";
import { FlowStageDialog } from "@/components/flow/flow-stage-dialog";
import { HOJE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import type { Contract, FaixaAntecedencia, FlowStageId } from "@/types";

const LANE_WIDTH = 132;
const CONTAINER_WIDTH = LANE_WIDTH * FLOW_STAGES.length;
const CONTAINER_HEIGHT = 460;
const SPINE_Y = 240;
const SPACING = 19;

interface PositionedContract {
  contract: Contract;
  x: number;
  y: number;
  faixa: FaixaAntecedencia;
}

function computePositions(contratos: Contract[]): PositionedContract[] {
  const positions: PositionedContract[] = [];

  FLOW_STAGES.forEach((stage, si) => {
    const nesta = contratos.filter((c) => c.etapaAtualId === stage.id).sort((a, b) => (a.id < b.id ? -1 : 1));
    const n = nesta.length;
    if (n === 0) return;
    const subCols = Math.max(1, Math.ceil(Math.sqrt(n)));
    const laneCenterX = si * LANE_WIDTH + LANE_WIDTH / 2;

    nesta.forEach((contract, k) => {
      const row = Math.floor(k / subCols);
      const col = k % subCols;
      const rows = Math.ceil(n / subCols);
      const x = laneCenterX + (col - (subCols - 1) / 2) * SPACING;
      const y = SPINE_Y + (row - (rows - 1) / 2) * SPACING;
      positions.push({ contract, x, y, faixa: classificarFaixa(contract, HOJE) });
    });
  });

  return positions;
}

const FAIXA_DOT: Record<FaixaAntecedencia, string> = {
  planejamento: "fill-[var(--blue-500)]",
  "meta-batida": "fill-[var(--green-500)]",
  atencao: "fill-[var(--amber-500)]",
  "zona-critica": "fill-[var(--red-500)]",
};

export function FlowNetwork() {
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const [laneSelecionada, setLaneSelecionada] = useState<FlowStageId | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);

  const positions = useMemo(() => computePositions(contratos), [contratos]);
  const hovered = positions.find((p) => p.contract.id === hoverId) ?? null;

  return (
    <>
      <div className="scrollbar-thin overflow-x-auto pb-2">
        <div className="relative" style={{ width: CONTAINER_WIDTH, height: CONTAINER_HEIGHT }}>
          {FLOW_STAGES.map((stage, si) => (
            <button
              key={stage.id}
              onClick={() => setLaneSelecionada(stage.id)}
              className={cn(
                "absolute top-0 flex h-full flex-col items-center justify-end gap-1.5 border-r border-border/40 pb-2 transition-colors hover:bg-accent/30",
                si % 2 === 0 ? "bg-slate-500/[0.02]" : ""
              )}
              style={{ left: si * LANE_WIDTH, width: LANE_WIDTH }}
            >
              <stage.icon className="size-4 text-muted-foreground" />
              <span className="max-w-[110px] truncate text-[10.5px] font-semibold text-muted-foreground">
                {stage.nomeCurto}
              </span>
              <span className="text-[10px] text-muted-foreground/70">
                {contratos.filter((c) => c.etapaAtualId === stage.id).length} contrato(s)
              </span>
            </button>
          ))}

          <svg className="pointer-events-none absolute inset-0" width={CONTAINER_WIDTH} height={CONTAINER_HEIGHT}>
            <line
              x1={0}
              y1={SPINE_Y}
              x2={CONTAINER_WIDTH}
              y2={SPINE_Y}
              stroke="var(--border)"
              strokeWidth={2}
              strokeDasharray="2 6"
            />
            {positions.map((p) => (
              <motion.circle
                key={p.contract.id}
                layout
                layoutId={`net-${p.contract.id}`}
                initial={false}
                animate={{ cx: p.x, cy: p.y }}
                transition={{ type: "spring", stiffness: 120, damping: 16 }}
                r={hoverId === p.contract.id ? 7.5 : 6}
                className={cn(FAIXA_DOT[p.faixa], "cursor-pointer stroke-white/70 dark:stroke-slate-950/70")}
                strokeWidth={1.5}
                onClick={() => abrirPainelContrato(p.contract.id)}
                onMouseEnter={() => setHoverId(p.contract.id)}
                onMouseLeave={() => setHoverId((id) => (id === p.contract.id ? null : id))}
              />
            ))}
          </svg>

          {hovered && (
            <div
              className="glass-strong pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-lg px-3 py-2 text-xs shadow-xl"
              style={{ left: hovered.x, top: hovered.y - 12 }}
            >
              <p className="font-semibold">
                {hovered.contract.numero} · {hovered.contract.empresa}
              </p>
              <p className="text-muted-foreground">
                {FAIXA_META[hovered.faixa].label} · {diasRestantes(hovered.contract.dataTermino, HOJE)}d restantes
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {(Object.keys(FAIXA_META) as FaixaAntecedencia[]).map((f) => (
          <span key={f} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className={cn("size-2.5 rounded-full", FAIXA_META[f].corClasse)} /> {FAIXA_META[f].label}
          </span>
        ))}
      </div>

      <FlowStageDialog
        titulo={laneSelecionada ? FLOW_STAGES.find((s) => s.id === laneSelecionada)!.nome : null}
        contratos={contratos.filter((c) => c.etapaAtualId === laneSelecionada)}
        onClose={() => setLaneSelecionada(null)}
      />
    </>
  );
}
