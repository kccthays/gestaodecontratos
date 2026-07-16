"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Contract } from "@/types";
import { classificarFaixa, diasRestantes, FAIXA_META, formatarData, formatarMoeda } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { HOJE } from "@/lib/mock-data";

const FAIXA_BADGE_VARIANT: Record<string, "info" | "success" | "warning" | "danger"> = {
  planejamento: "info",
  "meta-batida": "success",
  atencao: "warning",
  "zona-critica": "danger",
};

export const contractColumns: ColumnDef<Contract>[] = [
  {
    accessorKey: "numero",
    header: "Número",
    cell: ({ row }) => <span className="font-semibold">{row.original.numero}</span>,
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    cell: ({ row }) => <span className="block max-w-[200px] truncate">{row.original.empresa}</span>,
  },
  {
    accessorKey: "objeto",
    header: "Objeto",
    cell: ({ row }) => (
      <span className="block max-w-[220px] truncate text-muted-foreground">{row.original.objeto}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "fiscal",
    header: "Fiscal",
    cell: ({ row }) => <span className="block max-w-[150px] truncate">{row.original.fiscal}</span>,
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => formatarMoeda(row.original.valor),
  },
  {
    accessorKey: "dataTermino",
    header: "Vigência até",
    cell: ({ row }) => formatarData(row.original.dataTermino),
  },
  {
    id: "diasRestantes",
    header: "Dias restantes",
    accessorFn: (row) => diasRestantes(row.dataTermino, HOJE),
    cell: ({ row }) => {
      const dias = diasRestantes(row.original.dataTermino, HOJE);
      const faixa = classificarFaixa(row.original, HOJE);
      return (
        <span className={FAIXA_META[faixa].corTexto} style={{ fontWeight: 600 }}>
          {dias}d
        </span>
      );
    },
  },
  {
    id: "faixa",
    header: "Faixa",
    accessorFn: (row) => classificarFaixa(row, HOJE),
    cell: ({ row }) => {
      const faixa = classificarFaixa(row.original, HOJE);
      return <Badge variant={FAIXA_BADGE_VARIANT[faixa]}>{FAIXA_META[faixa].label}</Badge>;
    },
  },
  {
    id: "etapa",
    header: "Etapa",
    accessorFn: (row) => FLOW_STAGE_MAP[row.etapaAtualId].nome,
    cell: ({ row }) => <span className="text-xs text-muted-foreground">{FLOW_STAGE_MAP[row.original.etapaAtualId].nome}</span>,
  },
  {
    id: "acoes",
    header: "",
    enableSorting: false,
    cell: () => (
      <Button variant="ghost" size="icon-sm">
        <Eye className="size-3.5" />
      </Button>
    ),
  },
];
