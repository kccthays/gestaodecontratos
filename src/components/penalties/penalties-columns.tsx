"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import type { Penalty } from "@/types";
import { formatarData, formatarMoeda, PENALTY_CATEGORY_META } from "@/lib/calculations";

export const penaltyColumns: ColumnDef<Penalty>[] = [
  {
    accessorKey: "numeroProcesso",
    header: "Processo",
    cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.numeroProcesso}</span>,
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    cell: ({ row }) => <span className="block max-w-[200px] truncate">{row.original.empresa}</span>,
  },
  {
    id: "categoria",
    header: "Categoria",
    accessorFn: (row) => PENALTY_CATEGORY_META[row.categoria].label,
    cell: ({ row }) => <Badge variant="outline">{PENALTY_CATEGORY_META[row.original.categoria].label}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status === "finalizado" ? "success" : "info"}>
        {row.original.status === "finalizado" ? "Finalizado" : "Em andamento"}
      </Badge>
    ),
  },
  {
    accessorKey: "dataAbertura",
    header: "Abertura",
    cell: ({ row }) => formatarData(row.original.dataAbertura),
  },
  {
    accessorKey: "dataFinalizacao",
    header: "Finalização",
    cell: ({ row }) => (row.original.dataFinalizacao ? formatarData(row.original.dataFinalizacao) : "—"),
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => (row.original.valor ? formatarMoeda(row.original.valor) : "—"),
  },
];
