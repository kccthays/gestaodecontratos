"use client";

import { useMemo } from "react";
import { CalendarDays } from "lucide-react";
import { isFuture, parseISO } from "date-fns";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ContractCalendar } from "@/components/dashboard/contract-calendar";
import { useContractsStore } from "@/store/use-contracts-store";
import { formatarData } from "@/lib/calculations";
import type { CalendarEventType } from "@/types";

const TIPO_LABEL: Record<CalendarEventType, string> = {
  prorrogacao: "Prorrogação",
  vencimento: "Vencimento",
  penalidade: "Penalidade",
  evento: "Evento",
};

const TIPO_VARIANT: Record<CalendarEventType, "info" | "danger" | "warning" | "secondary"> = {
  prorrogacao: "info",
  vencimento: "danger",
  penalidade: "warning",
  evento: "secondary",
};

export default function CronogramaPage() {
  const eventos = useContractsStore((s) => s.eventos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  const proximos = useMemo(
    () =>
      eventos
        .filter((e) => isFuture(parseISO(e.data)))
        .sort((a, b) => (a.data < b.data ? -1 : 1))
        .slice(0, 10),
    [eventos]
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={CalendarDays}
        title="Cronograma"
        description="Calendário completo de prorrogações, vencimentos, penalidades e eventos institucionais."
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <ContractCalendar />
        </Card>

        <Card className="p-5">
          <p className="mb-3 text-sm font-semibold">Próximos eventos</p>
          <div className="space-y-2">
            {proximos.map((e) => (
              <button
                key={e.id}
                onClick={() => e.contratoId && abrirPainelContrato(e.contratoId)}
                className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold">{e.titulo}</p>
                  <p className="text-[11px] text-muted-foreground">{formatarData(e.data)}</p>
                </div>
                <Badge variant={TIPO_VARIANT[e.tipo]} className="shrink-0">
                  {TIPO_LABEL[e.tipo]}
                </Badge>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
