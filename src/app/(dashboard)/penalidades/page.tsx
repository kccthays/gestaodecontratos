"use client";

import { useMemo, useState } from "react";
import { ShieldAlert, Search } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { PenaltiesSection } from "@/components/dashboard/penalties-section";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { penaltyColumns } from "@/components/penalties/penalties-columns";
import { useContractsStore } from "@/store/use-contracts-store";
import { PENALTY_CATEGORY_META } from "@/lib/calculations";

export default function PenalidadesPage() {
  const penalidades = useContractsStore((s) => s.penalidades);
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("todos");
  const [categoria, setCategoria] = useState("todas");

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return penalidades.filter((p) => {
      if (q && !`${p.empresa} ${p.numeroProcesso}`.toLowerCase().includes(q)) return false;
      if (status !== "todos" && p.status !== status) return false;
      if (categoria !== "todas" && p.categoria !== categoria) return false;
      return true;
    });
  }, [penalidades, busca, status, categoria]);

  return (
    <div className="space-y-6">
      <SectionHeader
        icon={ShieldAlert}
        title="Penalidades"
        description="Gestão completa dos processos administrativos sancionadores."
      />

      <PenaltiesSection />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por empresa ou número do processo…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                <SelectItem value="andamento">Em andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoria} onValueChange={setCategoria}>
              <SelectTrigger className="w-[190px]">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as categorias</SelectItem>
                {Object.entries(PENALTY_CATEGORY_META).map(([id, meta]) => (
                  <SelectItem key={id} value={id}>
                    {meta.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <DataTable columns={penaltyColumns} data={filtrados} pageSize={10} emptyMessage="Nenhum processo encontrado." />
    </div>
  );
}
