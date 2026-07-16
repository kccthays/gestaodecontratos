"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { GitBranch, Share2, Sparkles, Workflow } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FlowOverviewKpis } from "@/components/flow/flow-overview-kpis";
import { FlowDiagram } from "@/components/flow/flow-diagram";
import { FlowNetwork } from "@/components/flow/flow-network";
import { FlowGargalosPanel } from "@/components/flow/flow-gargalos-panel";
import { FlowAiAnalysis } from "@/components/flow/flow-ai-analysis";

export default function FluxoPage() {
  const [modo, setModo] = useState<"fluxograma" | "rede">("fluxograma");
  const [gargalosAtivo, setGargalosAtivo] = useState(false);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Diferencial do sistema"
        icon={Workflow}
        title="Mapa Inteligente do Fluxo Contratual"
        description="Visualize todo o fluxo de cada contrato, do planejamento à nova vigência, e identifique gargalos automaticamente."
        action={
          <Button
            variant={gargalosAtivo ? "default" : "institutional"}
            onClick={() => setGargalosAtivo((v) => !v)}
          >
            <Sparkles className="size-4" />
            {gargalosAtivo ? "Ocultar gargalos" : "Identificar Gargalos"}
          </Button>
        }
      />

      <Card className="p-5">
        <p className="mb-3 text-sm font-semibold">Visão geral do fluxo</p>
        <FlowOverviewKpis />
      </Card>

      <AnimatePresence>{gargalosAtivo && <FlowGargalosPanel />}</AnimatePresence>

      <Card className="overflow-hidden p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold">Fluxo contratual</p>
          <Tabs value={modo} onValueChange={(v) => setModo(v as typeof modo)}>
            <TabsList>
              <TabsTrigger value="fluxograma">
                <GitBranch className="size-3.5" /> Fluxograma
              </TabsTrigger>
              <TabsTrigger value="rede">
                <Share2 className="size-3.5" /> Rede Inteligente
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {modo === "fluxograma" ? <FlowDiagram /> : <FlowNetwork />}
      </Card>

      <FlowAiAnalysis />
    </div>
  );
}
