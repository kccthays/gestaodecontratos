"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { useContractsStore } from "@/store/use-contracts-store";
import { calcularAgregadoEtapas, NODE_STATUS_META } from "@/lib/flow-node-status";
import { FLOW_STAGES } from "@/lib/flow-stages";
import { formatarData } from "@/lib/calculations";
import { FlowStageDialog } from "@/components/flow/flow-stage-dialog";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { FlowStageId } from "@/types";

export function FlowDiagram() {
  const contratos = useContractsStore((s) => s.contratos);
  const agregados = calcularAgregadoEtapas(contratos);
  const [selecionado, setSelecionado] = useState<FlowStageId | null>(null);

  const item = agregados.find((a) => a.stageId === selecionado);
  const stageMeta = selecionado ? FLOW_STAGES.find((s) => s.id === selecionado) : null;
  const contratosDoItem = selecionado ? contratos.filter((c) => c.etapaAtualId === selecionado) : [];

  return (
    <>
      <div className="scrollbar-thin overflow-x-auto pb-3">
        <div className="flex min-w-[1180px] items-stretch gap-0">
          {agregados.map((node, i) => {
            const stage = FLOW_STAGES.find((s) => s.id === node.stageId)!;
            const meta = NODE_STATUS_META[node.status];
            const isLast = i === agregados.length - 1;

            return (
              <div key={node.stageId} className="flex flex-1 items-stretch">
                <motion.button
                  onClick={() => setSelecionado(node.stageId)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  whileHover={{ y: -4 }}
                  className={cn(
                    "card-surface flex w-[168px] shrink-0 flex-col gap-2.5 rounded-2xl p-3.5 text-left ring-1 ring-transparent transition-shadow hover:shadow-lg",
                    meta.ring
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className={cn("flex size-9 items-center justify-center rounded-xl", meta.bg, meta.text)}>
                      <stage.icon className="size-4.5" />
                    </span>
                    <span className={cn("size-2 rounded-full", meta.dot, node.status === "andamento" && "animate-pulse-soft")} />
                  </div>

                  <div>
                    <p className="text-[13px] font-bold leading-tight">{stage.nome}</p>
                    <p className={cn("mt-0.5 text-[10px] font-medium", meta.text)}>{meta.label}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-extrabold tabular-nums">{node.quantidadeAtual}</span>
                    <span className="text-[10px] text-muted-foreground">contrato(s)</span>
                  </div>

                  <dl className="space-y-1 text-[10.5px] text-muted-foreground">
                    <div className="flex justify-between gap-2">
                      <dt>Tempo médio</dt>
                      <dd className="font-medium text-foreground">{node.tempoMedioDias}d</dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Últ. movim.</dt>
                      <dd className="truncate font-medium text-foreground">
                        {node.ultimaMovimentacao ? formatarData(node.ultimaMovimentacao) : "—"}
                      </dd>
                    </div>
                    <div className="truncate" title={node.responsavel}>
                      <dt className="inline">Resp.: </dt>
                      <dd className="inline font-medium text-foreground">{node.responsavel}</dd>
                    </div>
                  </dl>

                  <div>
                    <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
                      <span>Portfólio concluído</span>
                      <span className="font-semibold text-foreground">{node.percentualConcluido}%</span>
                    </div>
                    <Progress value={node.percentualConcluido} className="h-1.5" />
                  </div>
                </motion.button>

                {!isLast && (
                  <div className="relative flex w-8 shrink-0 items-center justify-center">
                    <svg className="h-full w-full overflow-visible" viewBox="0 0 32 100" preserveAspectRatio="none">
                      <line x1="0" y1="50" x2="32" y2="50" stroke="var(--border)" strokeWidth="2" />
                      <motion.line
                        x1="0"
                        y1="50"
                        x2="32"
                        y2="50"
                        stroke="var(--blue-400)"
                        strokeWidth="2.5"
                        strokeDasharray="6 8"
                        initial={{ strokeDashoffset: 0 }}
                        animate={{ strokeDashoffset: -28 }}
                        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <FlowStageDialog
        titulo={stageMeta?.nome ?? null}
        descricao={item ? `${item.quantidadeAtual} contrato(s) atualmente nesta etapa · tempo médio de ${item.tempoMedioDias} dias` : undefined}
        contratos={contratosDoItem}
        onClose={() => setSelecionado(null)}
      />
    </>
  );
}
