"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
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
    cell: ({ row }) => <span className="block max-w-[150px] truncate">{row.original.empresa}</span>,
  },
  {
    accessorKey: "objeto",
    header: "Objeto",
    meta: { className: "hidden 2xl:table-cell" },
    cell: ({ row }) => (
      <span className="block max-w-[200px] truncate text-muted-foreground">{row.original.objeto}</span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "fiscal",
    header: "Fiscal",
    meta: { className: "hidden lg:table-cell" },
    cell: ({ row }) => <span className="block max-w-[130px] truncate">{row.original.fiscal}</span>,
  },
  {
    accessorKey: "valor",
    header: "Valor",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatarMoeda(row.original.valor)}</span>,
  },
  {
    accessorKey: "dataTermino",
    header: "Vigência até",
    cell: ({ row }) => <span className="whitespace-nowrap">{formatarData(row.original.dataTermino)}</span>,
  },
  {
    id: "diasRestantes",
    header: "Dias rest.",
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
    id: "etapa",
    header: "Etapa",
    meta: { className: "hidden xl:table-cell" },
    accessorFn: (row) => FLOW_STAGE_MAP[row.etapaAtualId].nome,
    cell: ({ row }) => (
      <span className="block max-w-[130px] truncate text-xs text-muted-foreground">
        {FLOW_STAGE_MAP[row.original.etapaAtualId].nome}
      </span>
    ),
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
];
