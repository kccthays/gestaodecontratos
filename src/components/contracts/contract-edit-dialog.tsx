"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { CheckCircle2, Mail, Landmark, FileText, X } from "lucide-react";

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
import { Checkbox } from "@/components/ui/checkbox";
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
      <DialogContent className="max-h-[96vh] max-w-2xl gap-2.5 overflow-y-auto overflow-x-hidden p-5">
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
    emailsEmpresa: contrato.emailsEmpresa ?? [],
    orgaosAtendidos: contrato.orgaosAtendidos ?? [],
    documentos: contrato.documentos.map((d) => ({ ...d })),
  });

  const concluido = form.etapaAtualId === "nova-vigencia";

  function set<K extends keyof typeof form>(campo: K, valor: (typeof form)[K]) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  function toggleDocumento(indice: number) {
    setForm((f) => ({
      ...f,
      documentos: f.documentos.map((d, i) =>
        i === indice ? { ...d, status: d.status === "entregue" ? "pendente" : "entregue" } : d
      ),
    }));
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
      emailsEmpresa: form.emailsEmpresa,
      orgaosAtendidos: form.orgaosAtendidos,
      documentos: form.documentos,
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
      patch.diasAntecedenciaConclusao = diasRestantes(form.dataTermino, HOJE);
    }

    atualizarContrato(contrato.id, patch);
    toast.success(`Contrato ${contrato.numero} atualizado.`);
    onClose();
  }

  const docsEntregues = form.documentos.filter((d) => d.status === "entregue").length;

  return (
    <>
      <DialogHeader className="gap-0.5">
        <DialogTitle>Editar contrato {contrato.numero}</DialogTitle>
        <DialogDescription className="text-xs">As alterações valem em todas as páginas.</DialogDescription>
      </DialogHeader>

      <div className="space-y-1.5 [&_input]:h-8">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo id="edit-empresa" label="Empresa">
            <Input id="edit-empresa" value={form.empresa} onChange={(e) => set("empresa", e.target.value)} />
          </Campo>
          <Campo id="edit-fiscal" label="Fiscal">
            <Input id="edit-fiscal" value={form.fiscal} onChange={(e) => set("fiscal", e.target.value)} />
          </Campo>
        </div>

        <Campo id="edit-objeto" label="Objeto">
          <Textarea
            id="edit-objeto"
            rows={1}
            className="min-h-8"
            value={form.objeto}
            onChange={(e) => set("objeto", e.target.value)}
          />
        </Campo>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo id="edit-responsavel" label="Responsável atual">
            <Input
              id="edit-responsavel"
              value={form.responsavelAtual}
              onChange={(e) => set("responsavelAtual", e.target.value)}
            />
          </Campo>
          <Campo id="edit-valor" label="Valor (R$)">
            <Input
              id="edit-valor"
              type="number"
              min={0}
              step={1000}
              value={form.valor}
              onChange={(e) => set("valor", e.target.value)}
            />
          </Campo>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Campo id="edit-inicio" label="Início da vigência">
            <Input
              id="edit-inicio"
              type="date"
              value={form.dataInicio}
              onChange={(e) => set("dataInicio", e.target.value)}
            />
          </Campo>
          <Campo id="edit-termino" label="Término da vigência">
            <Input
              id="edit-termino"
              type="date"
              value={form.dataTermino}
              onChange={(e) => set("dataTermino", e.target.value)}
            />
          </Campo>
          <Campo id="edit-etapa" label="Etapa atual">
            <Select value={form.etapaAtualId} onValueChange={(v) => set("etapaAtualId", v as FlowStageId)}>
              <SelectTrigger id="edit-etapa" size="sm" className="w-full">
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
          </Campo>
        </div>

        {concluido && (
          <p className="flex items-center gap-1.5 rounded-lg bg-success-soft/50 px-3 py-1.5 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" /> Contrato marcado como concluído (nova vigência).
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <ListaEditavel
            icon={Mail}
            titulo="E-mails da empresa"
            placeholder="email@empresa.com.br"
            tipo="email"
            itens={form.emailsEmpresa}
            onAdd={(v) => set("emailsEmpresa", [...form.emailsEmpresa, v])}
            onRemove={(i) => set("emailsEmpresa", form.emailsEmpresa.filter((_, idx) => idx !== i))}
          />
          <ListaEditavel
            icon={Landmark}
            titulo="Órgãos públicos atendidos"
            placeholder="Nome do órgão"
            tipo="text"
            itens={form.orgaosAtendidos}
            onAdd={(v) => set("orgaosAtendidos", [...form.orgaosAtendidos, v])}
            onRemove={(i) => set("orgaosAtendidos", form.orgaosAtendidos.filter((_, idx) => idx !== i))}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">
            <FileText className="size-3.5 text-muted-foreground" /> Documentos de prorrogação
            <span className="ml-auto text-[11px] font-normal text-muted-foreground">
              {docsEntregues}/{form.documentos.length} entregues
            </span>
          </Label>
          <div className="grid grid-cols-1 gap-x-3 rounded-lg border border-border/60 p-1 sm:grid-cols-2">
            {form.documentos.map((doc, i) => (
              <div
                key={`${doc.nome}-${i}`}
                role="button"
                tabIndex={0}
                onClick={() => toggleDocumento(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleDocumento(i);
                  }
                }}
                className="flex w-full min-w-0 cursor-pointer items-center gap-2 rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-accent/50"
                title={doc.nome}
              >
                <Checkbox checked={doc.status === "entregue"} className="pointer-events-none shrink-0" />
                <span
                  className={
                    doc.status === "entregue"
                      ? "min-w-0 flex-1 truncate text-xs"
                      : "min-w-0 flex-1 truncate text-xs text-muted-foreground"
                  }
                >
                  {doc.nome}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Campo id="edit-obs" label="Observação de status">
            <Textarea
              id="edit-obs"
              rows={1}
              className="min-h-8"
              value={form.observacaoStatus}
              onChange={(e) => set("observacaoStatus", e.target.value)}
            />
          </Campo>
          <div className="flex items-center justify-between gap-3 self-end rounded-lg border border-border/70 px-3 py-1.5">
            <div className="min-w-0">
              <Label htmlFor="edit-plano">Plano de ação ativo</Label>
              <p className="text-[11px] text-muted-foreground">Necessário na Zona Crítica</p>
            </div>
            <Switch
              id="edit-plano"
              checked={form.temPlanoDeAcao}
              onCheckedChange={(v) => set("temPlanoDeAcao", v)}
            />
          </div>
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

function Campo({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function ListaEditavel({
  icon: Icon,
  titulo,
  placeholder,
  tipo,
  itens,
  onAdd,
  onRemove,
}: {
  icon: React.ComponentType<{ className?: string }>;
  titulo: string;
  placeholder: string;
  tipo: "text" | "email";
  itens: string[];
  onAdd: (valor: string) => void;
  onRemove: (indice: number) => void;
}) {
  const [novo, setNovo] = useState("");

  function adicionar() {
    const v = novo.trim();
    if (!v) return;
    onAdd(v);
    setNovo("");
  }

  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="flex items-center gap-1.5">
        <Icon className="size-3.5 text-muted-foreground" /> {titulo}
      </Label>
      {itens.length > 0 && (
        <div className="space-y-1">
          {itens.map((item, i) => (
            <div
              key={`${item}-${i}`}
              className="flex items-center gap-1.5 rounded-lg border border-border/60 px-2 py-1 text-xs"
            >
              <span className="min-w-0 flex-1 truncate" title={item}>
                {item}
              </span>
              <button
                type="button"
                onClick={() => onRemove(i)}
                className="flex size-5 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-danger-soft hover:text-danger"
                aria-label={`Remover ${item}`}
              >
                <X className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-1.5">
        <Input
          type={tipo}
          value={novo}
          placeholder={placeholder}
          className="h-8 text-xs"
          onChange={(e) => setNovo(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              adicionar();
            }
          }}
        />
        <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={adicionar}>
          Adicionar
        </Button>
      </div>
    </div>
  );
}
