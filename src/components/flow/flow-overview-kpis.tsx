"use client";

import { useState } from "react";
import { motion } from "framer-motion";

import { useContractsStore } from "@/store/use-contracts-store";
import { visaoGeralFluxo } from "@/lib/flow-calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { FlowStageDialog } from "@/components/flow/flow-stage-dialog";
import type { FlowStageId } from "@/types";

export function FlowOverviewKpis() {
  const contratos = useContractsStore((s) => s.contratos);
  const visao = visaoGeralFluxo(contratos);
  const [selecionado, setSelecionado] = useState<FlowStageId | null>(null);

  const item = visao.find((v) => v.stageId === selecionado) ?? null;

  return (
    <>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-9">
        {visao.map((v, i) => {
          const stage = FLOW_STAGE_MAP[v.stageId];
          const concluido = v.stageId === "nova-vigencia";
          return (
            <motion.button
              key={v.stageId}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => setSelecionado(v.stageId)}
              className="card-surface card-hover flex flex-col items-center gap-1.5 rounded-xl px-2 py-3.5 text-center"
            >
              <stage.icon className={`size-4.5 ${concluido ? "text-success" : "text-primary"}`} />
              <span className={`text-xl font-extrabold tabular-nums ${concluido ? "text-success" : ""}`}>
                {v.quantidade}
              </span>
              <span className="text-[10.5px] leading-tight text-muted-foreground">{v.nome}</span>
            </motion.button>
          );
        })}
      </div>

      <FlowStageDialog
        titulo={item ? FLOW_STAGE_MAP[item.stageId].nome : null}
        descricao={item ? FLOW_STAGE_MAP[item.stageId].descricao : undefined}
        contratos={item?.contratos ?? []}
        onClose={() => setSelecionado(null)}
      />
    </>
  );
}
