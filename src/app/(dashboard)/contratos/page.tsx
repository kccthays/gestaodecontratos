"use client";

import { useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/ui/data-table";
import { contractColumns } from "@/components/contracts/contracts-columns";
import { useContractsStore } from "@/store/use-contracts-store";
import { classificarFaixa } from "@/lib/calculations";
import { FLOW_STAGES } from "@/lib/flow-stages";
import { HOJE } from "@/lib/mock-data";
import type { Contract } from "@/types";

export default function ContratosPage() {
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);

  const [busca, setBusca] = useState("");
  const [faixa, setFaixa] = useState<string>("todas");
  const [etapa, setEtapa] = useState<string>("todas");
  const [ano, setAno] = useState<string>("todos");

  const anos = useMemo(
    () => Array.from(new Set(contratos.map((c) => c.anoExercicio))).sort((a, b) => b - a),
    [contratos]
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return contratos.filter((c: Contract) => {
      if (q) {
        const alvo = `${c.numero} ${c.empresa} ${c.objeto} ${c.fiscal} ${c.processoSEI} ${c.status}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      if (faixa !== "todas" && classificarFaixa(c, HOJE) !== faixa) return false;
      if (etapa !== "todas" && c.etapaAtualId !== etapa) return false;
      if (ano !== "todos" && String(c.anoExercicio) !== ano) return false;
      return true;
    });
  }, [contratos, busca, faixa, etapa, ano]);

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={FileText}
        title="Contratos"
        description={`${contratos.length} contratos monitorados pelo sistema`}
      />

      <Card className="p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar por contrato, empresa, objeto, fiscal, SEI ou status…"
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={faixa} onValueChange={setFaixa}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Faixa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as faixas</SelectItem>
                <SelectItem value="planejamento">Planejamento</SelectItem>
                <SelectItem value="meta-batida">Meta Batida</SelectItem>
                <SelectItem value="atencao">Atenção</SelectItem>
                <SelectItem value="zona-critica">Zona Crítica</SelectItem>
              </SelectContent>
            </Select>

            <Select value={etapa} onValueChange={setEtapa}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as etapas</SelectItem>
                {FLOW_STAGES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={ano} onValueChange={setAno}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os anos</SelectItem>
                {anos.map((a) => (
                  <SelectItem key={a} value={String(a)}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      <DataTable
        columns={contractColumns}
        data={filtrados}
        onRowClick={(c) => abrirPainelContrato(c.id)}
        pageSize={12}
        emptyMessage="Nenhum contrato corresponde aos filtros selecionados."
      />
    </div>
  );
}
