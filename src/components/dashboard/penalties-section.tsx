"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, FileCheck, FileClock, Loader2, ShieldAlert } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useContractsStore } from "@/store/use-contracts-store";
import { estatisticasPenalidades } from "@/lib/calculations";
import { indicadoresRapidosPenalidades } from "@/lib/recognition";
import { PENALTY_ICON } from "@/lib/penalty-icons";
import { useCountUp } from "@/hooks/use-count-up";

function StatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  suffix,
}: {
  icon: typeof ShieldAlert;
  label: string;
  value: number;
  colorClass: string;
  suffix?: string;
}) {
  const count = useCountUp(value, 1200);
  return (
    <Card className="flex-row items-center gap-3.5 p-4">
      <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${colorClass}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-2xl font-extrabold tabular-nums leading-none">
          {count}
          {suffix}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}

export function PenaltiesSection() {
  const penalidades = useContractsStore((s) => s.penalidades);
  const stats = estatisticasPenalidades(penalidades);
  const rapidos = indicadoresRapidosPenalidades(penalidades);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
        <StatCard icon={Loader2} label="Processos em andamento" value={stats.andamento} colorClass="bg-info/15 text-info" />
        <StatCard icon={CheckCircle2} label="Finalizados" value={stats.finalizados} colorClass="bg-success/15 text-success" />
        <StatCard icon={ShieldAlert} label="Total de processos" value={stats.total} colorClass="bg-primary/15 text-primary" />
      </div>

      <Card className="p-5">
        <p className="mb-4 text-sm font-semibold">Distribuição por etapa (processos em andamento)</p>
        <div className="space-y-3.5">
          {stats.porCategoria.map((cat, i) => {
            const Icon = PENALTY_ICON[cat.categoria];
            return (
              <motion.div
                key={cat.categoria}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                whileHover={{ scale: 1.01 }}
                className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent/50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110">
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1.5 flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium text-foreground">{cat.label}</span>
                    <span className="shrink-0 font-semibold text-muted-foreground">
                      {cat.quantidade} · {cat.percentual}%
                    </span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${cat.percentual}%` }}
                      transition={{ duration: 0.9, delay: i * 0.06 + 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-400 group-hover:from-blue-600 group-hover:to-blue-500"
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <MiniIndicator icon={FileCheck} label="Pagamentos instruídos" value={rapidos.pagamentosInstruidos} />
        <MiniIndicator icon={CheckCircle2} label="Atos oficiais publicados" value={rapidos.atosOficiaisPublicados} />
        <MiniIndicator icon={FileClock} label="Documentos pendentes" value={rapidos.documentosPendentes} />
        <MiniIndicator
          icon={Clock}
          label="Tempo médio de resposta"
          value={rapidos.tempoMedioResposta ?? 0}
          suffix=" dias"
          indisponivel={rapidos.tempoMedioResposta == null}
        />
      </div>
    </div>
  );
}

function MiniIndicator({
  icon: Icon,
  label,
  value,
  suffix = "",
  indisponivel = false,
}: {
  icon: typeof ShieldAlert;
  label: string;
  value: number;
  suffix?: string;
  indisponivel?: boolean;
}) {
  const count = useCountUp(value, 1200);
  return (
    <Card className="p-4">
      <Icon className="mb-2 size-4 text-primary" />
      <p className="text-xl font-extrabold tabular-nums">{indisponivel ? "—" : `${count}${suffix}`}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">{label}</p>
    </Card>
  );
}
