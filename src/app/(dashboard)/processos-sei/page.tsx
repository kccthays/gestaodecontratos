"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { FolderKanban, Search } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { useContractsStore } from "@/store/use-contracts-store";
import { formatarData } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import type { Contract } from "@/types";

const columns: ColumnDef<Contract>[] = [
  {
    accessorKey: "processoSEI",
    header: "Processo SEI",
    cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.processoSEI}</span>,
  },
  {
    accessorKey: "numero",
    header: "Contrato",
  },
  {
    accessorKey: "empresa",
    header: "Empresa",
    cell: ({ row }) => <span className="block max-w-[200px] truncate">{row.original.empresa}</span>,
  },
  {
    id: "etapa",
    header: "Etapa atual",
    accessorFn: (row) => FLOW_STAGE_MAP[row.etapaAtualId].nome,
    cell: ({ row }) => <Badge variant="outline">{FLOW_STAGE_MAP[row.original.etapaAtualId].nome}</Badge>,
  },
  {
    accessorKey: "responsavelAtual",
    header: "Responsável atual",
  },
  {
    accessorKey: "ultimaMovimentacao",
    header: "Última movimentação",
    cell: ({ row }) => formatarData(row.original.ultimaMovimentacao),
  },
];

export default function ProcessosSeiPage() {
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const [busca, setBusca] = useState("");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return contratos;
    return contratos.filter((c) => `${c.processoSEI} ${c.numero} ${c.empresa}`.toLowerCase().includes(q));
  }, [contratos, busca]);

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={FolderKanban}
        title="Processos SEI"
        description="Todos os processos administrativos vinculados aos contratos monitorados."
      />

      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar por número SEI, contrato ou empresa…"
            className="pl-9"
          />
        </div>
      </Card>

      <DataTable
        columns={columns}
        data={filtrados}
        onRowClick={(c) => abrirPainelContrato(c.id)}
        pageSize={14}
        emptyMessage="Nenhum processo encontrado."
      />
    </div>
  );
}
