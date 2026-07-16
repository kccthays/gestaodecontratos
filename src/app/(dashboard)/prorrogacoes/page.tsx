"use client";

import { useMemo } from "react";
import { RefreshCw } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { AntecedenciaCards } from "@/components/dashboard/antecedencia-cards";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { contractColumns } from "@/components/contracts/contracts-columns";
import { useContractsStore } from "@/store/use-contracts-store";
import { isConcluido } from "@/lib/calculations";
import { useCountUp } from "@/hooks/use-count-up";

function StatBlock({ label, value }: { label: string; value: number }) {
  const count = useCountUp(value, 1000);
  return (
    <div>
      <p className="text-3xl font-extrabold tabular-nums">{count}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

export default function ProrrogacoesPage() {
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  const pendentes = useMemo(() => contratos.filter((c) => !isConcluido(c)), [contratos]);
  const concluidos = contratos.length - pendentes.length;
  const percentual = contratos.length > 0 ? Math.round((concluidos / contratos.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={RefreshCw}
        title="Prorrogações"
        description="Pipeline de prorrogações contratuais em andamento, por faixa de antecedência."
      />

      <Card className="grid grid-cols-3 divide-x divide-border/70 p-5 text-center">
        <StatBlock label="Em andamento" value={pendentes.length} />
        <StatBlock label="Concluídas" value={concluidos} />
        <StatBlock label="% concluído" value={percentual} />
      </Card>

      <AntecedenciaCards />

      <div>
        <p className="mb-3 text-sm font-semibold">Todas as prorrogações em andamento</p>
        <DataTable
          columns={contractColumns}
          data={pendentes}
          onRowClick={(c) => abrirPainelContrato(c.id)}
          pageSize={10}
          emptyMessage="Nenhuma prorrogação em andamento."
        />
      </div>
    </div>
  );
}
