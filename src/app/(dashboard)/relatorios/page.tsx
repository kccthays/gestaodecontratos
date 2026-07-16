"use client";

import { useState } from "react";
import { FileBarChart, FileDown, FileText, ShieldAlert, BarChart3 } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useContractsStore } from "@/store/use-contracts-store";
import { agruparPorFaixa, estatisticasPenalidades, FAIXA_META, formatarMoeda } from "@/lib/calculations";
import { prorrogacoesConcluidasStats } from "@/lib/indicators";
import { ReportPrintTemplate, type ReportType } from "@/components/reports/report-print-template";

export default function RelatoriosPage() {
  const contratos = useContractsStore((s) => s.contratos);
  const penalidades = useContractsStore((s) => s.penalidades);
  const [tipoImpressao, setTipoImpressao] = useState<ReportType>(null);

  const grupos = agruparPorFaixa(contratos);
  const penaltyStats = estatisticasPenalidades(penalidades);
  const prorrogacoes = prorrogacoesConcluidasStats(contratos);
  const valorTotal = contratos.reduce((acc, c) => acc + c.valor, 0);

  function exportar(tipo: ReportType) {
    setTipoImpressao(tipo);
    requestAnimationFrame(() => {
      window.print();
    });
  }

  return (
    <div className="space-y-5">
      <SectionHeader icon={FileBarChart} title="Relatórios" description="Resumos exportáveis para prestação de contas e reuniões." />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" /> Relatório de Contratos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {contratos.length} contratos monitorados · {formatarMoeda(valorTotal)} em valor total.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {(Object.keys(grupos) as (keyof typeof grupos)[]).map((f) => (
                <li key={f} className="flex justify-between">
                  <span>{FAIXA_META[f].label}</span>
                  <span className="font-semibold text-foreground">{grupos[f].length}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <Button size="sm" variant="outline" className="mx-5 mb-5" onClick={() => exportar("contratos")}>
            <FileDown className="size-3.5" /> Exportar PDF
          </Button>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldAlert className="size-4 text-warning" /> Relatório de Penalidades
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {penaltyStats.total} processos · {penaltyStats.andamento} em andamento · {penaltyStats.finalizados}{" "}
              finalizados.
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {penaltyStats.porCategoria.slice(0, 4).map((c) => (
                <li key={c.categoria} className="flex justify-between">
                  <span>{c.label}</span>
                  <span className="font-semibold text-foreground">{c.quantidade}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <Button size="sm" variant="outline" className="mx-5 mb-5" onClick={() => exportar("penalidades")}>
            <FileDown className="size-3.5" /> Exportar PDF
          </Button>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="size-4 text-info" /> Relatório de Indicadores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p className="text-muted-foreground">
              {prorrogacoes.percentual}% das prorrogações concluídas ({prorrogacoes.concluidos} de {prorrogacoes.total}
              ).
            </p>
            <p className="text-xs text-muted-foreground">Inclui visão geral do fluxo por etapa.</p>
          </CardContent>
          <Button size="sm" variant="outline" className="mx-5 mb-5" onClick={() => exportar("indicadores")}>
            <FileDown className="size-3.5" /> Exportar PDF
          </Button>
        </Card>
      </div>

      <ReportPrintTemplate tipo={tipoImpressao} contratos={contratos} penalidades={penalidades} />
    </div>
  );
}
