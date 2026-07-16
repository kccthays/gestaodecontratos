"use client";

import { motion } from "framer-motion";
import {
  Banknote,
  CheckCircle2,
  ClipboardPlus,
  PartyPopper,
  Percent,
  Timer,
  type LucideIcon,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { useContractsStore } from "@/store/use-contracts-store";
import { calcularReconhecimento } from "@/lib/recognition";
import { formatarMoeda } from "@/lib/calculations";
import { useCountUp } from "@/hooks/use-count-up";
import { HOJE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface IndicatorDef {
  label: string;
  icon: LucideIcon;
  value: number | null;
  render?: (value: number) => string;
  celebrate?: boolean;
  promptText: string;
}

export function RecognitionCards() {
  const contratos = useContractsStore((s) => s.contratos);
  const penalidades = useContractsStore((s) => s.penalidades);
  const stats = calcularReconhecimento(contratos, penalidades, HOJE);

  const indicadores: IndicatorDef[] = [
    {
      label: "Retorno Zero",
      icon: PartyPopper,
      value: stats.processosRetornados,
      celebrate: stats.processosRetornados === 0,
      render: (v) => (v === 0 ? "Zero" : String(v)),
      promptText: "Preencha os dados de processos devolvidos para visualizar este indicador.",
    },
    {
      label: "Impacto do mês",
      icon: ClipboardPlus,
      value: stats.impactoDoMes,
      render: (v) => `${v} TA${v === 1 ? "" : "s"}`,
      promptText: "Aguardando dados de publicações do mês.",
    },
    {
      label: "Processos concluídos",
      icon: CheckCircle2,
      value: stats.processosConcluidos,
      promptText: "Preencha os dados de processos concluídos.",
    },
    {
      label: "Economia gerada",
      icon: Banknote,
      value: stats.economiaGerada,
      render: (v) => formatarMoeda(v),
      promptText: "Preencha os dados de economia gerada nas renegociações para visualizar este indicador.",
    },
    {
      label: "Tempo médio de conclusão",
      icon: Timer,
      value: stats.tempoMedioConclusaoDias,
      render: (v) => `${v} dias`,
      promptText: "Aguardando histórico suficiente de conclusões.",
    },
    {
      label: "Percentual de cumprimento",
      icon: Percent,
      value: stats.percentualCumprimento,
      render: (v) => `${v}%`,
      promptText: "Preencha os dados para calcular o percentual de cumprimento.",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-3 xl:grid-cols-6">
      {indicadores.map((ind, i) => (
        <IndicatorCard key={ind.label} {...ind} delay={i * 0.06} />
      ))}
    </div>
  );
}

function IndicatorCard({
  label,
  icon: Icon,
  value,
  render,
  celebrate,
  promptText,
  delay,
}: IndicatorDef & { delay: number }) {
  const numeric = value ?? 0;
  const count = useCountUp(value != null ? numeric : 0, 1200, value != null);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card
        className={cn(
          "h-full items-center gap-2 p-4 text-center",
          value == null && "border-dashed bg-transparent shadow-none",
          celebrate && "bg-gradient-to-b from-success-soft to-transparent"
        )}
      >
        <div
          className={cn(
            "flex size-10 items-center justify-center rounded-xl",
            celebrate ? "bg-success/20 text-success" : "bg-primary/10 text-primary"
          )}
        >
          <Icon className="size-5" />
        </div>
        {value == null ? (
          <p className="text-[11px] leading-snug text-muted-foreground">{promptText}</p>
        ) : (
          <>
            <p className={cn("text-xl font-extrabold tabular-nums", celebrate && "text-success")}>
              {render ? render(count) : count}
            </p>
            <p className="text-[11px] text-muted-foreground">{label}</p>
          </>
        )}
      </Card>
    </motion.div>
  );
}
