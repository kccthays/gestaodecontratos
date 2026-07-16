"use client";

import { motion } from "framer-motion";
import { Flame, ShieldCheck, TimerReset } from "lucide-react";

import { useContractsStore } from "@/store/use-contracts-store";
import { calcularStreak, formatarDataLonga } from "@/lib/calculations";
import { useCountUp } from "@/hooks/use-count-up";
import { HOJE } from "@/lib/mock-data";

export function StreakCounter() {
  const contratos = useContractsStore((s) => s.contratos);
  const streakDesde = useContractsStore((s) => s.streakDesde);
  const streak = calcularStreak(contratos, streakDesde, HOJE);
  const contador = useCountUp(streak.disponivel ? streak.dias : 0, 1600, streak.disponivel);

  if (!streak.disponivel) {
    return (
      <div className="glass-strong relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl px-6 py-10 text-center">
        <TimerReset className="size-8 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">Aguardando histórico suficiente.</p>
      </div>
    );
  }

  const critico = streak.contratosAtivosSemPlano > 0;

  return (
    <div className="glass-strong relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div
          className={`animate-glow absolute left-1/2 top-1/2 h-52 w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl ${
            critico ? "bg-danger/20" : "bg-blue-400/25"
          }`}
        />
      </div>

      <div className="relative flex flex-col items-center gap-3 text-center">
        <div className="flex items-center gap-2 rounded-full border border-border/70 bg-surface-solid/50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {critico ? <Flame className="size-3.5 text-danger" /> : <ShieldCheck className="size-3.5 text-success" />}
          Indicador Principal
        </div>

        <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
          Dias consecutivos sem nenhum contrato entrar na Zona Crítica sem plano de ação
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18 }}
          className={`text-gradient text-[4.5rem] font-black leading-none tabular-nums sm:text-[6.5rem] ${
            critico ? "!bg-none !text-danger" : ""
          }`}
        >
          {contador}
        </motion.div>

        <p className="text-xs text-muted-foreground">
          {critico
            ? `${streak.contratosAtivosSemPlano} contrato(s) crítico(s) sem plano de ação — contador zerado`
            : `Sequência iniciada em ${streak.desde ? formatarDataLonga(streak.desde) : "—"}`}
        </p>
      </div>
    </div>
  );
}
