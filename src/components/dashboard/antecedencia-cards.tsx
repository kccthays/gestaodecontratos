"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Flame,
  MoreVertical,
  PartyPopper,
  Pencil,
  RotateCcw,
  Trophy,
  type LucideIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ContractEditDialog } from "@/components/contracts/contract-edit-dialog";
import { useContractsStore } from "@/store/use-contracts-store";
import { usePermissao } from "@/hooks/use-auth";
import { agruparPorFaixa, diasRestantes, FAIXA_META, isConcluido } from "@/lib/calculations";
import { HOJE } from "@/lib/mock-data";
import type { Contract, FaixaAntecedencia } from "@/types";
import { cn } from "@/lib/utils";

const FAIXA_ICON: Record<FaixaAntecedencia, LucideIcon> = {
  planejamento: ClipboardList,
  "meta-batida": Trophy,
  atencao: AlertTriangle,
  "zona-critica": Flame,
};

const FAIXA_ICON_BG: Record<FaixaAntecedencia, string> = {
  planejamento: "bg-info/15 text-info",
  "meta-batida": "bg-success/15 text-success",
  atencao: "bg-warning/15 text-warning",
  "zona-critica": "bg-danger/15 text-danger",
};

export function AntecedenciaCards() {
  const contratos = useContractsStore((s) => s.contratos);
  const grupos = agruparPorFaixa(contratos, HOJE);
  const ordem: FaixaAntecedencia[] = ["planejamento", "meta-batida", "atencao", "zona-critica"];

  const podeEditar = usePermissao("editar_contratos");
  const podeMoverFluxo = usePermissao("editar_fluxo");
  const [editId, setEditId] = useState<string | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {ordem.map((faixa, i) => (
          <FaixaCard
            key={faixa}
            faixa={faixa}
            contratos={grupos[faixa]}
            delay={i * 0.08}
            podeEditar={podeEditar}
            podeMoverFluxo={podeMoverFluxo}
            onEditar={setEditId}
          />
        ))}
      </div>
      <ContractEditDialog contratoId={editId} onClose={() => setEditId(null)} />
    </>
  );
}

function FaixaCard({
  faixa,
  contratos,
  delay,
  podeEditar,
  podeMoverFluxo,
  onEditar,
}: {
  faixa: FaixaAntecedencia;
  contratos: Contract[];
  delay: number;
  podeEditar: boolean;
  podeMoverFluxo: boolean;
  onEditar: (id: string) => void;
}) {
  const [expandido, setExpandido] = useState(false);
  const meta = FAIXA_META[faixa];
  const Icon = FAIXA_ICON[faixa];
  const visiveis = expandido ? contratos : contratos.slice(0, 4);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "card-surface card-hover flex flex-col rounded-2xl p-4",
        faixa === "zona-critica" && contratos.length > 0 && "ring-1 ring-danger/30"
      )}
    >
      <div className="mb-3 flex items-center gap-3">
        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl", FAIXA_ICON_BG[faixa])}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{meta.label}</p>
          <p className="truncate text-[11px] text-muted-foreground">{meta.descricao}</p>
        </div>
        <span className={cn("text-2xl font-extrabold tabular-nums", meta.corTexto)}>{contratos.length}</span>
      </div>

      {contratos.length === 0 ? (
        <EmptyState faixa={faixa} />
      ) : (
        <div className="flex flex-1 flex-col gap-1.5">
          {visiveis.map((c) => (
            <ContratoRow
              key={c.id}
              contrato={c}
              corClasse={meta.corClasse}
              podeEditar={podeEditar}
              podeMoverFluxo={podeMoverFluxo}
              onEditar={onEditar}
            />
          ))}
          {contratos.length > 4 && (
            <button
              onClick={() => setExpandido((v) => !v)}
              className="mt-1 rounded-lg py-1 text-center text-[11px] font-semibold text-primary hover:underline"
            >
              {expandido ? "Ver menos" : `+${contratos.length - 4} outros`}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

function ContratoRow({
  contrato,
  corClasse,
  podeEditar,
  podeMoverFluxo,
  onEditar,
}: {
  contrato: Contract;
  corClasse: string;
  podeEditar: boolean;
  podeMoverFluxo: boolean;
  onEditar: (id: string) => void;
}) {
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const marcarConcluido = useContractsStore((s) => s.marcarConcluido);
  const reabrirContrato = useContractsStore((s) => s.reabrirContrato);
  const concluido = isConcluido(contrato);
  const mostrarMenu = podeEditar || podeMoverFluxo;

  function concluir() {
    marcarConcluido(contrato.id);
    const antecedencia = diasRestantes(contrato.dataTermino, HOJE);
    if (antecedencia >= 90 && antecedencia <= 120) {
      toast.success(`Contrato ${contrato.numero} concluído e movido para “Meta Batida”.`);
    } else {
      toast.success(
        `Contrato ${contrato.numero} marcado como concluído. Como foi finalizado com ${antecedencia} dia(s) de antecedência, ele sai das faixas de acompanhamento — você continua vendo-o na página Contratos.`
      );
    }
  }

  function reabrir() {
    reabrirContrato(contrato.id);
    toast.info(`Contrato ${contrato.numero} reaberto para acompanhamento.`);
  }

  return (
    <div className="group flex items-center gap-1 rounded-lg pr-1 transition-colors hover:bg-accent/60">
      <button
        onClick={() => abrirPainelContrato(contrato.id)}
        className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 text-left"
      >
        <span className={cn("size-1.5 shrink-0 rounded-full", corClasse)} />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1 truncate text-xs font-semibold text-foreground">
            {concluido && <CheckCircle2 className="size-3 shrink-0 text-success" />}
            {contrato.numero} <span className="font-normal text-muted-foreground">· {contrato.empresa}</span>
          </p>
          <p className="truncate text-[11px] text-muted-foreground">{contrato.observacaoStatus}</p>
        </div>
        <span className="shrink-0 text-[11px] font-semibold text-muted-foreground group-hover:text-foreground">
          {diasRestantes(contrato.dataTermino, HOJE)}d
        </span>
      </button>

      {mostrarMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground opacity-60 transition-colors hover:bg-accent hover:text-foreground focus:opacity-100 group-hover:opacity-100"
              aria-label={`Ações do contrato ${contrato.numero}`}
            >
              <MoreVertical className="size-3.5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            {podeMoverFluxo &&
              (concluido ? (
                <DropdownMenuItem onClick={reabrir}>
                  <RotateCcw /> Reabrir contrato
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={concluir}>
                  <CheckCircle2 /> Marcar como concluído
                </DropdownMenuItem>
              ))}
            {podeMoverFluxo && podeEditar && <DropdownMenuSeparator />}
            {podeEditar && (
              <DropdownMenuItem onClick={() => onEditar(contrato.id)}>
                <Pencil /> Editar contrato
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}

function EmptyState({ faixa }: { faixa: FaixaAntecedencia }) {
  if (faixa === "zona-critica") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-2 rounded-xl bg-success-soft/40 py-6 text-center">
        <PartyPopper className="size-6 text-success" />
        <p className="text-xs font-medium text-success">Nenhum contrato encontra-se em Zona Crítica.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border py-6 text-center">
      <p className="text-xs text-muted-foreground">Nenhum contrato nesta faixa no momento.</p>
    </div>
  );
}
