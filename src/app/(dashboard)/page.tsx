import { Gauge, ShieldAlert, Waypoints, Award, LineChart } from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { StreakCounter } from "@/components/dashboard/streak-counter";
import { AntecedenciaCards } from "@/components/dashboard/antecedencia-cards";
import { PenaltiesSection } from "@/components/dashboard/penalties-section";
import { BottleneckBoard } from "@/components/dashboard/bottleneck-board";
import { RecognitionCards } from "@/components/dashboard/recognition-cards";
import { ContractTimeline } from "@/components/dashboard/contract-timeline";
import { ContractCalendar } from "@/components/dashboard/contract-calendar";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <section>
        <SectionHeader
          eyebrow="Área 1"
          icon={Gauge}
          title="Controle de Antecedência"
          description="Acompanhamento das prorrogações contratuais por faixa de antecedência ao vencimento."
        />
        <div className="space-y-5">
          <StreakCounter />
          <AntecedenciaCards />
        </div>
      </section>

      <section>
        <SectionHeader
          eyebrow="Área 2"
          icon={ShieldAlert}
          title="Penalidades"
          description="Panorama dos processos administrativos sancionadores em andamento e finalizados."
        />
        <PenaltiesSection />
      </section>

      <section>
        <SectionHeader
          eyebrow="Área 3"
          icon={Waypoints}
          title="Onde está travado"
          description="Identificação automática dos principais pontos de retenção do setor."
        />
        <BottleneckBoard />
      </section>

      <section>
        <SectionHeader
          eyebrow="Área 4"
          icon={Award}
          title="Reconhecimento e Impacto"
          description="Indicadores de desempenho, linha do tempo do fluxo e calendário de eventos."
        />
        <div className="space-y-5">
          <RecognitionCards />

          <Card className="p-5">
            <p className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <LineChart className="size-4 text-primary" /> Linha do Tempo do Fluxo Contratual
            </p>
            <ContractTimeline />
          </Card>

          <Card className="p-5">
            <p className="mb-1 text-sm font-semibold">Calendário</p>
            <p className="mb-4 text-xs text-muted-foreground">
              Prorrogações, vencimentos, penalidades e eventos institucionais.
            </p>
            <ContractCalendar />
          </Card>
        </div>
      </section>
    </div>
  );
}
