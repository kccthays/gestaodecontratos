"use client";

import type { Contract } from "@/types";
import { diasRestantes, formatarData, formatarMoeda } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { useAuthStore } from "@/store/use-auth-store";

export function ContractPrintTemplate({ contract }: { contract: Contract | null }) {
  const info = useAuthStore((s) => s.infoInstitucional);
  if (!contract) return <div className="print-area" />;

  return (
    <div className="print-area hidden text-black print:block">
      <div style={{ borderBottom: "3px solid #1351b4", paddingBottom: 12, marginBottom: 16 }}>
        <p style={{ fontSize: 11, color: "#475467" }}>
          SIGC · {info.unidade} · {info.setor} · {info.cidade} — {info.estado}
        </p>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#0b2a5c" }}>
          Contrato {contract.numero} — Ficha Resumo
        </h1>
      </div>

      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <tbody>
          {[
            ["Empresa", contract.empresa],
            ["CNPJ", contract.cnpj],
            ["Objeto", contract.objeto],
            ["Fiscal", contract.fiscal],
            ["Valor", formatarMoeda(contract.valor)],
            ["Início da vigência", formatarData(contract.dataInicio)],
            ["Término da vigência", formatarData(contract.dataTermino)],
            ["Dias restantes", `${diasRestantes(contract.dataTermino)} dias`],
            ["Processo SEI", contract.processoSEI],
            ["Etapa atual", FLOW_STAGE_MAP[contract.etapaAtualId].nome],
            ["Responsável atual", contract.responsavelAtual],
            ["Última movimentação", formatarData(contract.ultimaMovimentacao)],
          ].map(([label, value]) => (
            <tr key={label} style={{ borderBottom: "1px solid #e4e7ec" }}>
              <td style={{ padding: "6px 8px", fontWeight: 600, width: 180, color: "#344054" }}>{label}</td>
              <td style={{ padding: "6px 8px" }}>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8, color: "#0b2a5c" }}>
        Histórico
      </h2>
      <ul style={{ fontSize: 11, lineHeight: 1.7 }}>
        {contract.historico.map((h, i) => (
          <li key={i}>
            {formatarData(h.data)} — {h.evento} ({h.autor})
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8, color: "#0b2a5c" }}>
        Checklist de documentos
      </h2>
      <ul style={{ fontSize: 11, lineHeight: 1.7 }}>
        {contract.checklist.map((c, i) => (
          <li key={i}>
            [{c.concluido ? "x" : " "}] {c.item}
          </li>
        ))}
      </ul>

      <p style={{ fontSize: 9, color: "#98a2b3", marginTop: 24 }}>
        Documento gerado automaticamente pelo SIGC em {formatarData(new Date().toISOString().slice(0, 10))}.
      </p>
    </div>
  );
}
