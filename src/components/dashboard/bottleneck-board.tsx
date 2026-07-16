"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, FileText, LayoutGrid, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useContractsStore } from "@/store/use-contracts-store";
import { montarQuadroGargalos, type QuadroGargaloItem } from "@/lib/bottlenecks";
import { diasRestantes, formatarData } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";

export function BottleneckBoard() {
  const contratos = useContractsStore((s) => s.contratos);
  const penalidades = useContractsStore((s) => s.penalidades);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const [selecionado, setSelecionado] = useState<QuadroGargaloItem | null>(null);

  const itens = montarQuadroGargalos(contratos, penalidades).slice(0, 6);

  if (itens.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center">
        <LayoutGrid className="size-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Nenhum gargalo identificado no momento.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itens.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card-surface card-hover flex flex-col items-center gap-1 rounded-2xl px-4 py-5 text-center"
          >
            <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {item.origem === "penalidade" ? <ShieldAlert className="size-3.5" /> : <FileText className="size-3.5" />}
              {item.titulo}
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground/40" />
            <span className="text-sm font-semibold text-foreground">{item.subtitulo}</span>
            <ChevronDown className="size-3.5 text-muted-foreground/40" />
            <span
              className={`text-4xl font-black tabular-nums ${
                item.quantidade >= 5 ? "text-danger" : item.quantidade >= 3 ? "text-warning" : "text-primary"
              }`}
            >
              {item.quantidade}
            </span>
            <Button size="sm" variant="outline" className="mt-3" onClick={() => setSelecionado(item)}>
              Ver detalhes
            </Button>
          </motion.div>
        ))}
      </div>

      <Dialog open={!!selecionado} onOpenChange={(v) => !v && setSelecionado(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          {selecionado && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selecionado.titulo} · {selecionado.subtitulo}
                </DialogTitle>
                <DialogDescription>{selecionado.quantidade} item(ns) parado(s) nesta etapa</DialogDescription>
              </DialogHeader>
              <div className="space-y-2">
                {selecionado.contratos.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      abrirPainelContrato(c.id);
                      setSelecionado(null);
                    }}
                    className="flex w-full items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <FileText className="size-4 shrink-0 text-primary" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {c.numero} · {c.empresa}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">{c.responsavelAtual}</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {diasRestantes(c.dataTermino, HOJE)}d
                    </Badge>
                  </button>
                ))}
                {selecionado.penalidades.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center gap-3 rounded-xl border border-border/70 px-3.5 py-2.5"
                  >
                    <ShieldAlert className="size-4 shrink-0 text-warning" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{p.empresa}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {p.numeroProcesso} · aberto em {formatarData(p.dataAbertura)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
