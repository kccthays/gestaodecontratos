"use client";

import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlarmClockPlus, ArrowUpRight, ListOrdered, TimerReset, TrendingUp } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContractsStore } from "@/store/use-contracts-store";
import {
  contratosEmRiscoProximos30Dias,
  contratosParadosMaisTempo,
  identificarGargalos,
  sugerirPrioridades,
  tempoMedioGeralPorEtapa,
} from "@/lib/flow-calculations";
import { diasRestantes, formatarData } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function FlowGargalosPanel() {
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  const gargalos = identificarGargalos(contratos).filter((g) => g.quantidade > 0).slice(0, 4);
  const parados = contratosParadosMaisTempo(contratos, 5);
  const tempos = tempoMedioGeralPorEtapa(contratos);
  const risco30 = contratosEmRiscoProximos30Dias(contratos).filter((c) => diasRestantes(c.dataTermino, HOJE) <= 30);
  const prioridades = sugerirPrioridades(contratos, 5);

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="grid grid-cols-1 gap-4 overflow-hidden lg:grid-cols-2"
    >
      <Card className="p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TrendingUp className="size-4 text-primary" /> Maior concentração de contratos
        </p>
        <div className="space-y-2.5">
          {gargalos.map((g) => (
            <div key={g.stageId} className="flex items-center justify-between rounded-lg bg-accent/40 px-3 py-2 text-sm">
              <span className="font-medium">{g.nome}</span>
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                média {g.tempoMedioDias}d
                <Badge variant={g.quantidade >= 5 ? "danger" : "warning"}>{g.quantidade}</Badge>
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <TimerReset className="size-4 text-primary" /> Parados há mais tempo
        </p>
        <div className="space-y-1.5">
          {parados.map((c) => {
            const estado = c.fluxo.find((f) => f.stageId === c.etapaAtualId);
            return (
              <button
                key={c.id}
                onClick={() => abrirPainelContrato(c.id)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent/60"
              >
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{c.numero}</span>{" "}
                  <span className="text-muted-foreground">· {c.empresa}</span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-danger">{estado?.diasNaEtapa ?? 0}d parado</span>
              </button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5 lg:col-span-2">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <AlarmClockPlus className="size-4 text-primary" /> Tempo médio por etapa
        </p>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tempos} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="nome" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} width={28} />
              <Tooltip
                cursor={{ fill: "var(--accent)" }}
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                formatter={(value) => [`${value} dias`, "Tempo médio"]}
              />
              <Bar dataKey="tempoMedioDias" fill="var(--blue-500)" radius={[6, 6, 0, 0]} maxBarSize={44} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ArrowUpRight className="size-4 text-danger" /> Risco de Zona Crítica em 30 dias
        </p>
        {risco30.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">Nenhum contrato em risco iminente.</p>
        ) : (
          <div className="space-y-1.5">
            {risco30.map((c) => (
              <button
                key={c.id}
                onClick={() => abrirPainelContrato(c.id)}
                className="flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent/60"
              >
                <span className="min-w-0 truncate">
                  <span className="font-semibold">{c.numero}</span>{" "}
                  <span className="text-muted-foreground">· {c.empresa}</span>
                </span>
                <Badge variant="danger" className="shrink-0">
                  {diasRestantes(c.dataTermino, HOJE)}d
                </Badge>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <ListOrdered className="size-4 text-primary" /> Ordem de prioridade sugerida
        </p>
        <div className="space-y-1.5">
          {prioridades.map((p, i) => (
            <button
              key={p.contrato.id}
              onClick={() => abrirPainelContrato(p.contrato.id)}
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-accent/60"
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white",
                  i === 0 ? "bg-danger" : i === 1 ? "bg-warning" : "bg-slate-400"
                )}
              >
                {i + 1}
              </span>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-semibold">{p.contrato.numero}</span>{" "}
                <span className="text-muted-foreground">· {p.contrato.empresa}</span>
              </span>
              <span className="shrink-0 text-[10px] text-muted-foreground">{formatarData(p.contrato.dataTermino)}</span>
            </button>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
