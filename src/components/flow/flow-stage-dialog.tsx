"use client";

import { FileText } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useContractsStore } from "@/store/use-contracts-store";
import { diasRestantes } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";
import type { Contract } from "@/types";

interface FlowStageDialogProps {
  titulo: string | null;
  descricao?: string;
  contratos: Contract[];
  onClose: () => void;
}

export function FlowStageDialog({ titulo, descricao, contratos, onClose }: FlowStageDialogProps) {
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  return (
    <Dialog open={!!titulo} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{titulo}</DialogTitle>
          <DialogDescription>{descricao ?? `${contratos.length} contrato(s) nesta etapa`}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          {contratos.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhum contrato nesta etapa.</p>
          )}
          {contratos.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                abrirPainelContrato(c.id);
                onClose();
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
