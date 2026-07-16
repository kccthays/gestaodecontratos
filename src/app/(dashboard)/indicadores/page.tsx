"use client";

import { BarChart3, Building2, Calendar, CheckCircle2, Timer, UserRound } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useContractsStore } from "@/store/use-contracts-store";
import {
  contratosPorAno,
  contratosPorEmpresa,
  contratosPorFiscal,
  mapaTemporalVencimentos,
  prorrogacoesConcluidasStats,
} from "@/lib/indicators";
import { calcularReconhecimento } from "@/lib/recognition";
import { estatisticasPenalidades } from "@/lib/calculations";
import { PENALTY_ICON } from "@/lib/penalty-icons";
import { HOJE } from "@/lib/mock-data";
import { useCountUp } from "@/hooks/use-count-up";

const tooltipStyle = {
  background: "var(--popover)",
  border: "1px solid var(--border)",
  borderRadius: 10,
  fontSize: 12,
  color: "var(--popover-foreground)",
};

const axisTick = { fontSize: 11, fill: "var(--muted-foreground)" };

function ChartCard({ title, icon: Icon, children }: { title: string; icon: typeof BarChart3; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Icon className="size-4 text-primary" /> {title}
      </p>
      {children}
    </Card>
  );
}

export default function IndicadoresPage() {
  const contratos = useContractsStore((s) => s.contratos);
  const penalidades = useContractsStore((s) => s.penalidades);

  const porAno = contratosPorAno(contratos);
  const porEmpresa = contratosPorEmpresa(contratos);
  const porFiscal = contratosPorFiscal(contratos);
  const vencimentos = mapaTemporalVencimentos(contratos, HOJE);
  const prorrogacoes = prorrogacoesConcluidasStats(contratos);
  const reconhecimento = calcularReconhecimento(contratos, penalidades, HOJE);
  const penaltyStats = estatisticasPenalidades(penalidades);

  const tempoMedio = useCountUp(reconhecimento.tempoMedioConclusaoDias ?? 0, 1200);
  const percentualConcluido = useCountUp(prorrogacoes.percentual, 1200);

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={BarChart3}
        title="Indicadores"
        description="Dashboard analítico com a evolução histórica dos contratos e prorrogações."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="items-center gap-1 p-4 text-center">
          <CheckCircle2 className="size-5 text-success" />
          <p className="text-2xl font-extrabold tabular-nums">{prorrogacoes.concluidos}</p>
          <p className="text-xs text-muted-foreground">Prorrogações concluídas</p>
        </Card>
        <Card className="items-center gap-1 p-4 text-center">
          <BarChart3 className="size-5 text-primary" />
          <p className="text-2xl font-extrabold tabular-nums">{percentualConcluido}%</p>
          <p className="text-xs text-muted-foreground">Percentual concluído</p>
          <Progress value={prorrogacoes.percentual} className="mt-1 h-1.5 w-full" />
        </Card>
        <Card className="items-center gap-1 p-4 text-center">
          <Timer className="size-5 text-info" />
          <p className="text-2xl font-extrabold tabular-nums">{tempoMedio}d</p>
          <p className="text-xs text-muted-foreground">Tempo médio de conclusão</p>
        </Card>
        <Card className="items-center gap-1 p-4 text-center">
          <UserRound className="size-5 text-warning" />
          <p className="text-2xl font-extrabold tabular-nums">{penaltyStats.total}</p>
          <p className="text-xs text-muted-foreground">Processos de penalidade</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ChartCard title="Quantidade de contratos por ano" icon={Calendar}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porAno} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="ano" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="quantidade" name="Contratos" fill="var(--blue-500)" radius={[6, 6, 0, 0]} maxBarSize={46} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Mapa temporal de vencimentos (12 meses)" icon={Calendar}>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vencimentos} margin={{ left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="mes" tick={axisTick} axisLine={{ stroke: "var(--border)" }} tickLine={false} interval={0} angle={-35} textAnchor="end" height={50} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="quantidade" name="Vencimentos" radius={[6, 6, 0, 0]} maxBarSize={28}>
                  {vencimentos.map((v, i) => (
                    <Cell key={i} fill={v.quantidade > 3 ? "var(--red-500)" : "var(--blue-500)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Contratos por empresa" icon={Building2}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEmpresa} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ ...axisTick, fontSize: 10.5 }}
                  axisLine={false}
                  tickLine={false}
                  width={130}
                />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="quantidade" name="Contratos" fill="var(--blue-500)" radius={[0, 6, 6, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Contratos por fiscal" icon={UserRound}>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porFiscal} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis
                  type="category"
                  dataKey="nome"
                  tick={{ ...axisTick, fontSize: 10.5 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip cursor={{ fill: "var(--accent)" }} contentStyle={tooltipStyle} />
                <Bar dataKey="quantidade" name="Contratos" fill="var(--blue-400)" radius={[0, 6, 6, 0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Distribuição de penalidades por etapa" icon={BarChart3}>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {penaltyStats.porCategoria.map((cat) => {
            const Icon = PENALTY_ICON[cat.categoria];
            return (
              <div key={cat.categoria} className="flex items-center gap-3 rounded-xl border border-border/60 px-3.5 py-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <Icon className="size-4.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{cat.label}</p>
                  <p className="text-[11px] text-muted-foreground">{cat.quantidade} processos · {cat.percentual}%</p>
                </div>
              </div>
            );
          })}
        </div>
      </ChartCard>
    </div>
  );
}
