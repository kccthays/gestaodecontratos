"use client";

import { motion } from "framer-motion";
import { FileSignature, Gauge, Megaphone, PenTool, Scale, Send, UserCheck, BadgeCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useContractsStore } from "@/store/use-contracts-store";
import type { FlowStageId } from "@/types";
import { cn } from "@/lib/utils";

interface TimelineNode {
  label: string;
  icon: LucideIcon;
  stages?: FlowStageId[];
  marker?: boolean;
}

const NODES: TimelineNode[] = [
  { label: "Contrato", icon: FileSignature, marker: true },
  { label: "140 dias antes", icon: Gauge, marker: true },
  { label: "Solicitação", icon: Send, stages: ["solicitacao"] },
  { label: "Fiscal", icon: UserCheck, stages: ["fiscalizacao", "area-tecnica"] },
  { label: "Jurídico", icon: Scale, stages: ["juridico"] },
  { label: "Assinaturas", icon: PenTool, stages: ["assinaturas"] },
  { label: "Publicação", icon: Megaphone, stages: ["publicacao"] },
  { label: "Nova vigência", icon: BadgeCheck, stages: ["nova-vigencia"] },
];

export function ContractTimeline() {
  const contratos = useContractsStore((s) => s.contratos);

  return (
    <div className="scrollbar-thin overflow-x-auto pb-2">
      <div className="flex min-w-[860px] items-start">
        {NODES.map((node, i) => {
          const emAndamento = node.stages
            ? contratos.filter((c) => node.stages!.includes(c.etapaAtualId)).length
            : null;
          const concluidos = node.stages
            ? contratos.filter((c) => c.fluxo.find((f) => node.stages!.includes(f.stageId))?.status === "concluida")
                .length
            : null;
          const ativo = (emAndamento ?? 0) > 0;

          return (
            <div key={node.label} className="flex flex-1 items-start last:flex-none">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex w-[104px] shrink-0 flex-col items-center gap-2 text-center"
              >
                <div
                  className={cn(
                    "flex size-11 items-center justify-center rounded-full border-2 shadow-sm transition-colors",
                    node.marker
                      ? "border-dashed border-slate-300 bg-transparent text-muted-foreground dark:border-slate-600"
                      : ativo
                      ? "border-info bg-info-soft text-info animate-pulse-soft"
                      : (concluidos ?? 0) > 0
                      ? "border-success bg-success-soft text-success"
                      : "border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800"
                  )}
                >
                  <node.icon className="size-4.5" />
                </div>
                <span className="text-[11px] font-semibold leading-tight">{node.label}</span>
                {node.stages && (
                  <span className="text-[10px] text-muted-foreground">
                    {emAndamento}&nbsp;ativos · {concluidos}&nbsp;concluídos
                  </span>
                )}
              </motion.div>

              {i < NODES.length - 1 && (
                <div className="relative mt-[22px] h-0.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.8, delay: i * 0.15, repeat: Infinity, repeatDelay: 1.2, ease: "linear" }}
                    className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
