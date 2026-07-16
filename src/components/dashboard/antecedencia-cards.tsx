"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ClipboardList, Flame, PartyPopper, Trophy, type LucideIcon } from "lucide-react";

import { useContractsStore } from "@/store/use-contracts-store";
import { agruparPorFaixa, diasRestantes, FAIXA_META } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";
import type { Contract, FaixaAntecedencia } from "@/types";
import { cn } from "@/lib/utils";

const FAIXA_ICON: Record<FaixaAntecedencia, LucideIcon> = {
  planejamento: ClipboardList,
  "meta-batida": Trophy,
  atencao: AlertTriangle,
  "zona-critica": Flame,
};

const FAIXA_ICON_BG: Record<FaixaAntecedencia, string> = {
  planejamento: "bg-info/15 text-info",
  "meta-batida": "bg-success/15 text-success",
  atencao: "bg-warning/15 text-warning",
  "zona-critica": "bg-danger/15 text-danger",
};

export function AntecedenciaCards() {
  const contratos = useContractsStore((s) => s.contratos);
  const grupos = agruparPorFaixa(contratos, HOJE);
  const ordem: FaixaAntecedencia[] = ["planejamento", "meta-batida", "atencao", "zona-critica"];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {ordem.map((faixa, i) => (
        <FaixaCard key={faixa} faixa={faixa} contratos={grupos[faixa]} delay={i * 0.08} />
      ))}
    </div>
  );
}

function FaixaCard({ faixa, contratos, delay }: { faixa: FaixaAntecedencia; contratos: Contract[]; delay: number }) {
  const [expandido, setExpandido] = useState(false);
  const meta = FAIXA_META[faixa];
  const Icon = FAIXA_ICON[faixa];
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const visiveis = expandido ? contratos : contratos.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "card-surface card-hover flex flex-col rounded-2xl p-4",
        faixa === "zona-critica" && contratos.length > 0 && "ring-1 ring-danger/30"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", FAIXA_ICON_BG[faixa])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{meta.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{meta.descricao}</p>
        </div>
        <span className={cn("text-2xl font-extrabold tabular-nums", meta.corTexto)}>{contratos.length}</span>
      </div>

      {contratos.length === 0 ? (
        <EmptyState faixa={faixa} />
      ) : (
        <div className="flex flex-1 flex-col gap-1.5">
          {visiveis.map((c) => (
            <button
              key={c.id}
              onClick={() => abrirPainelContrato(c.id)}
              className="group flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-accent/60"
            >
              <span className={cn("size-1.5 shrink-0 rounded-full", meta.corClasse)} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-foreground">
                  {c.numero} <span className="font-normal text-muted-foreground">· {c.empresa}</span>
                </p>
                <p className="truncate text-[11px] text-muted-foreground">{c.observacaoStatus}</p>
              </div>
              <span className="shrink-0 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
                {diasRestantes(c.dataTermino, HOJE)}d
              </span>
            </button>
          ))}
          {contratos.length > 4 && (
            <button
              onClick={() => setExpandido((v) => !v)}
              className="mt-1 rounded-lg py-1 text-center text-[11px] font-semibold text-primary hover:underline"
            >
              {expandido ? "Ver menos" : `+${contratos.length - 4} outros`}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function EmptyState({ faixa }: { faixa: FaixaAntecedencia }) {
  if (faixa === "zona-critica") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-success-soft/40 py-6 text-center">
        <PartyPopper className="size-6 text-success" />
        <p className="text-xs font-medium text-success">Nenhum contrato encontra-se em Zona Crítica.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-6 text-center">
      <p className="text-xs text-muted-foreground">Nenhum contrato nesta faixa no momento.</p>
    </div>
  );
}
