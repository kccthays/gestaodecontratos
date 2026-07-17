"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useContractsStore } from "@/store/use-contracts-store";
import { diasRestantes } from "@/lib/calculations";
import { FLOW_STAGES, recalcularFluxoPara } from "@/lib/flow-stages";
import { HOJE } from "@/lib/mock-data";
import type { Contract, FlowStageId } from "@/types";

const DATA_HOJE = format(HOJE, "yyyy-MM-dd");

export function ContractEditDialog({
  contratoId,
  onClose,
}: {
  contratoId: string | null;
  onClose: () => void;
}) {
  const contratos = useContractsStore((s) => s.contratos);
  const contrato = contratoId ? contratos.find((c) => c.id === contratoId) ?? null : null;

  return (
    <Dialog open={!!contratoId} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        {contrato && <EditForm key={contrato.id} contrato={contrato} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({ contrato, onClose }: { contrato: Contract; onClose: () => void }) {
  const atualizarContrato = useContractsStore((s) => s.atualizarContrato);
  const [form, setForm] = useState({
    empresa: contrato.empresa,
    objeto: contrato.objeto,
    fiscal: contrato.fiscal,
    responsavelAtual: contrato.responsavelAtual,
    valor: String(contrato.valor),
    dataInicio: contrato.dataInicio,
    dataTermino: contrato.dataTermino,
    etapaAtualId: contrato.etapaAtualId,
    temPlanoDeAcao: contrato.temPlanoDeAcao,
    observacaoStatus: contrato.observacaoStatus ?? "",
  });

  const concluido = form.etapaAtualId === "nova-vigencia";

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function salvar() {
    const valorNum = Number(form.valor);
    const etapaMudou = form.etapaAtualId !== contrato.etapaAtualId;

    const patch: Partial<Contract> = {
      empresa: form.empresa.trim() || contrato.empresa,
      objeto: form.objeto.trim() || contrato.objeto,
      fiscal: form.fiscal.trim() || contrato.fiscal,
      responsavelAtual: form.responsavelAtual.trim() || contrato.responsavelAtual,
      valor: Number.isFinite(valorNum) && valorNum > 0 ? valorNum : contrato.valor,
      dataInicio: form.dataInicio,
      dataTermino: form.dataTermino,
      etapaAtualId: form.etapaAtualId,
      temPlanoDeAcao: form.temPlanoDeAcao,
      observacaoStatus: form.observacaoStatus,
    };

    if (etapaMudou) {
      patch.fluxo = recalcularFluxoPara(contrato.fluxo, form.etapaAtualId, DATA_HOJE);
      patch.ultimaMovimentacao = DATA_HOJE;
      if (form.etapaAtualId === "nova-vigencia") {
        patch.status = "vigente";
        patch.diasAntecedenciaConclusao = diasRestantes(form.dataTermino, HOJE);
        patch.ultimaMovimentacaoDescricao = "Prorrogação concluída — nova vigência registrada";
      } else {
        patch.diasAntecedenciaConclusao = undefined;
      }
    } else if (concluido && form.dataTermino !== contrato.dataTermino) {
      // Continua concluído, mas a data de término mudou: recalcula a antecedência.
      patch.diasAntecedenciaConclusao = diasRestantes(form.dataTermino, HOJE);
    }

    atualizarContrato(contrato.id, patch);
    toast.success(`Contrato ${contrato.numero} atualizado.`);
    onClose();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>Editar contrato {contrato.numero}</DialogTitle>
        <DialogDescription>
          Altere as informações do contrato. Mudar a etapa para “Nova Vigência” marca o contrato como
          concluído.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-3.5">
        <div className="space-y-1.5">
          <Label htmlFor="edit-empresa">Empresa</Label>
          <Input id="edit-empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="edit-objeto">Objeto</Label>
          <Textarea
            id="edit-objeto"
            rows={2}
            value={form.objeto}
            onChange={(e) => set("objeto", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-fiscal">Fiscal</Label>
            <Input id="edit-fiscal" value={form.fiscal} onChange={(e) => set("fiscal", e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-responsavel">Responsável atual</Label>
            <Input
              id="edit-responsavel"
              value={form.responsavelAtual}
              onChange={(e) => set("responsavelAtual", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-inicio">Início da vigência</Label>
            <Input
              id="edit-inicio"
              type="date"
              value={form.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-termino">Término da vigência</Label>
            <Input
              id="edit-termino"
              type="date"
              value={form.dataTermino}
              onChange={(e) => set("dataTermino", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="edit-valor">Valor (R$)</Label>
            <Input
              id="edit-valor"
              type="number"
              min={0}
              step={1000}
              value={form.valor}
              onChange={(e) => set("valor", e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-etapa">Etapa atual</Label>
            <Select
              value={form.etapaAtualId}
              onValueChange={(v) => set("etapaAtualId", v as FlowStageId)}
            >
              <SelectTrigger id="edit-etapa" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FLOW_STAGES.map((stage) => (
                  <SelectItem key={stage.id} value={stage.id}>
                    {stage.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {concluido && (
          <p className="flex items-center gap-1.5 rounded-lg bg-success-soft/50 px-3 py-2 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" /> Este contrato está marcado como concluído (nova vigência).
          </p>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="edit-obs">Observação de status</Label>
          <Textarea
            id="edit-obs"
            rows={2}
            value={form.observacaoStatus}
            onChange={(e) => set("observacaoStatus", e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
          <div>
            <Label htmlFor="edit-plano">Plano de ação ativo</Label>
            <p className="text-xs text-muted-foreground">Necessário para contratos em Zona Crítica</p>
          </div>
          <Switch
            id="edit-plano"
            checked={form.temPlanoDeAcao}
            onCheckedChange={(v) => set("temPlanoDeAcao", v)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={salvar}>Salvar alterações</Button>
      </DialogFooter>
    </>
  );
}
