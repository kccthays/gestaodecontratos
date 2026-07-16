"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronLeft, ChevronRight, FileText, RefreshCw, ShieldAlert, CalendarClock, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { useContractsStore } from "@/store/use-contracts-store";
import type { CalendarEvent, CalendarEventType } from "@/types";
import { cn } from "@/lib/utils";
import { HOJE } from "@/lib/mock-data";

const TIPO_META: Record<CalendarEventType, { label: string; dot: string; icon: typeof FileText }> = {
  prorrogacao: { label: "Prorrogação", dot: "bg-info", icon: RefreshCw },
  vencimento: { label: "Vencimento", dot: "bg-danger", icon: CalendarClock },
  penalidade: { label: "Penalidade", dot: "bg-warning", icon: ShieldAlert },
  evento: { label: "Evento", dot: "bg-slate-400", icon: Sparkles },
};

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function ContractCalendar() {
  const eventos = useContractsStore((s) => s.eventos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const [mesAtual, setMesAtual] = useState(startOfMonth(HOJE));
  const [diaSelecionado, setDiaSelecionado] = useState<Date | null>(null);

  const dias = useMemo(() => {
    const inicio = startOfWeek(startOfMonth(mesAtual), { weekStartsOn: 0 });
    const fim = endOfWeek(endOfMonth(mesAtual), { weekStartsOn: 0 });
    return eachDayOfInterval({ start: inicio, end: fim });
  }, [mesAtual]);

  const eventosPorDia = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    eventos.forEach((e) => {
      const key = e.data;
      const arr = map.get(key) ?? [];
      arr.push(e);
      map.set(key, arr);
    });
    return map;
  }, [eventos]);

  const eventosDoDia = diaSelecionado ? eventosPorDia.get(format(diaSelecionado, "yyyy-MM-dd")) ?? [] : [];

  return (
    <>
      <div>
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold capitalize">{format(mesAtual, "MMMM 'de' yyyy", { locale: ptBR })}</p>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" onClick={() => setMesAtual(startOfMonth(HOJE))}>
              Hoje
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setMesAtual((m) => subMonths(m, 1))}>
              <ChevronLeft className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" onClick={() => setMesAtual((m) => addMonths(m, 1))}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((d) => (
            <span key={d} className="text-[11px] font-semibold text-muted-foreground">
              {d}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {dias.map((dia) => {
            const key = format(dia, "yyyy-MM-dd");
            const eventosDia = eventosPorDia.get(key) ?? [];
            const foraDoMes = !isSameMonth(dia, mesAtual);
            const hoje = isToday(dia);

            return (
              <button
                key={key}
                onClick={() => eventosDia.length > 0 && setDiaSelecionado(dia)}
                disabled={eventosDia.length === 0}
                className={cn(
                  "flex aspect-square flex-col items-center justify-start gap-1 rounded-lg border border-transparent p-1 pt-1.5 text-xs transition-colors sm:aspect-[4/3.4]",
                  foraDoMes && "opacity-30",
                  hoje && "border-primary/60 bg-primary/5",
                  eventosDia.length > 0 && "cursor-pointer hover:border-border hover:bg-accent/60",
                  eventosDia.length === 0 && "cursor-default"
                )}
              >
                <span className={cn("font-semibold", hoje && "text-primary")}>{format(dia, "d")}</span>
                <div className="flex flex-wrap items-center justify-center gap-0.5">
                  {eventosDia.slice(0, 3).map((e, i) => (
                    <span key={i} className={cn("size-1.5 rounded-full", TIPO_META[e.tipo].dot)} />
                  ))}
                  {eventosDia.length > 3 && <span className="text-[9px] text-muted-foreground">+{eventosDia.length - 3}</span>}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {(Object.keys(TIPO_META) as CalendarEventType[]).map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className={cn("size-2 rounded-full", TIPO_META[t].dot)} /> {TIPO_META[t].label}
            </span>
          ))}
        </div>
      </div>

      <Sheet open={!!diaSelecionado} onOpenChange={(v) => !v && setDiaSelecionado(null)}>
        <SheetContent className="w-full sm:max-w-sm">
          <SheetHeader>
            <SheetTitle className="capitalize">
              {diaSelecionado && format(diaSelecionado, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </SheetTitle>
            <SheetDescription>{eventosDoDia.length} evento(s) neste dia</SheetDescription>
          </SheetHeader>
          <div className="space-y-2 overflow-y-auto p-6">
            {eventosDoDia.map((e) => {
              const meta = TIPO_META[e.tipo];
              return (
                <button
                  key={e.id}
                  onClick={() => {
                    if (e.contratoId) {
                      setDiaSelecionado(null);
                      abrirPainelContrato(e.contratoId);
                    }
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-xl border border-border/70 px-3.5 py-3 text-left",
                    e.contratoId && "transition-colors hover:bg-accent"
                  )}
                >
                  <span className={cn("mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg text-white", meta.dot)}>
                    <meta.icon className="size-3.5" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{e.titulo}</p>
                    {e.descricao && <p className="truncate text-xs text-muted-foreground">{e.descricao}</p>}
                    <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground/70">{meta.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
