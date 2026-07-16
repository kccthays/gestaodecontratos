"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

import { useContractsStore } from "@/store/use-contracts-store";
import { gerarAnaliseIA } from "@/lib/flow-calculations";

export function FlowAiAnalysis() {
  const contratos = useContractsStore((s) => s.contratos);
  const texto = gerarAnaliseIA(contratos);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-strong relative overflow-hidden rounded-2xl p-5"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 size-40 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="relative flex items-start gap-3.5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white shadow-lg shadow-blue-900/20">
          <Sparkles className="size-5" />
        </div>
        <div>
          <p className="mb-1.5 flex items-center gap-2 text-sm font-bold">
            Análise da IA
            <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-semibold text-blue-500">
              gerado automaticamente
            </span>
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">{texto}</p>
        </div>
      </div>
    </motion.div>
  );
}
