import type { Contract, Penalty } from "@/types";
import { agruparPorFaixa, estatisticasPenalidades, FAIXA_META, formatarData, formatarMoeda } from "@/lib/calculations";
import { visaoGeralFluxo } from "@/lib/flow-calculations";
import { prorrogacoesConcluidasStats } from "@/lib/indicators";
import { calcularReconhecimento } from "@/lib/recognition";

export type ReportType = "contratos" | "penalidades" | "indicadores" | null;

interface ReportPrintTemplateProps {
  tipo: ReportType;
  contratos: Contract[];
  penalidades: Penalty[];
}

function Header({ title }: { title: string }) {
  return (
    <div style={{ borderBottom: "3px solid #1351b4", paddingBottom: 12, marginBottom: 16 }}>
      <p style={{ fontSize: 11, color: "#475467" }}>
        SIGC · Secretaria de Serviços Compartilhados · Superintendência Regional de Administração
      </p>
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0b2a5c" }}>{title}</h1>
      <p style={{ fontSize: 10, color: "#98a2b3" }}>Emitido em {formatarData(new Date().toISOString().slice(0, 10))}</p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <tr style={{ borderBottom: "1px solid #e4e7ec" }}>
      <td style={{ padding: "6px 8px", fontWeight: 600, width: 260, color: "#344054" }}>{label}</td>
      <td style={{ padding: "6px 8px" }}>{value}</td>
    </tr>
  );
}

export function ReportPrintTemplate({ tipo, contratos, penalidades }: ReportPrintTemplateProps) {
  if (!tipo) return <div className="print-area" />;

  if (tipo === "contratos") {
    const grupos = agruparPorFaixa(contratos);
    const valorTotal = contratos.reduce((acc, c) => acc + c.valor, 0);
    return (
      <div className="print-area hidden text-black print:block">
        <Header title="Relatório de Contratos" />
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Total de contratos monitorados" value={contratos.length} />
            <Row label="Valor total monitorado" value={formatarMoeda(valorTotal)} />
            {(Object.keys(grupos) as (keyof typeof grupos)[]).map((faixa) => (
              <Row key={faixa} label={FAIXA_META[faixa].label} value={`${grupos[faixa].length} contrato(s)`} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (tipo === "penalidades") {
    const stats = estatisticasPenalidades(penalidades);
    return (
      <div className="print-area hidden text-black print:block">
        <Header title="Relatório de Penalidades" />
        <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
          <tbody>
            <Row label="Total de processos" value={stats.total} />
            <Row label="Em andamento" value={stats.andamento} />
            <Row label="Finalizados" value={stats.finalizados} />
            {stats.porCategoria.map((c) => (
              <Row key={c.categoria} label={c.label} value={`${c.quantidade} (${c.percentual}%)`} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  const prorrogacoes = prorrogacoesConcluidasStats(contratos);
  const reconhecimento = calcularReconhecimento(contratos, penalidades);
  const visao = visaoGeralFluxo(contratos);

  return (
    <div className="print-area hidden text-black print:block">
      <Header title="Relatório de Indicadores" />
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <tbody>
          <Row label="Prorrogações concluídas" value={prorrogacoes.concluidos} />
          <Row label="Percentual concluído" value={`${prorrogacoes.percentual}%`} />
          <Row label="Tempo médio de conclusão" value={`${reconhecimento.tempoMedioConclusaoDias ?? "—"} dias`} />
          {visao.map((v) => (
            <Row key={v.stageId} label={v.nome} value={`${v.quantidade} contrato(s)`} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
