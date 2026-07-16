"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Copy,
  ExternalLink,
  FileDown,
  FileText,
  Pencil,
  ScrollText,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { useContractsStore, useContratoSelecionado } from "@/store/use-contracts-store";
import {
  classificarFaixa,
  diasRestantes,
  FAIXA_META,
  formatarData,
  formatarMoeda,
} from "@/lib/calculations";
import { FLOW_STAGES } from "@/lib/flow-stages";
import { cn } from "@/lib/utils";

const STAGE_STATUS_DOT: Record<string, string> = {
  concluida: "bg-success",
  andamento: "bg-info animate-pulse-soft",
  proxima: "bg-warning",
  atrasada: "bg-danger animate-pulse-soft",
  "nao-iniciada": "bg-slate-300 dark:bg-slate-600",
};

const STATUS_LABEL: Record<string, string> = {
  vigente: "Vigente",
  "em-prorrogacao": "Em prorrogação",
  "aguardando-assinatura": "Aguardando assinatura",
  encerrado: "Encerrado",
};

export function ContractDetailPanel() {
  const contrato = useContratoSelecionado();
  const painelAberto = useContractsStore((s) => s.painelAberto);
  const fecharPainelContrato = useContractsStore((s) => s.fecharPainelContrato);
  const atualizarContrato = useContractsStore((s) => s.atualizarContrato);

  const [editOpen, setEditOpen] = useState(false);
  const [seiOpen, setSeiOpen] = useState(false);
  const [tab, setTab] = useState("geral");
  const [form, setForm] = useState({
    responsavelAtual: "",
    observacaoStatus: "",
    fiscal: "",
    temPlanoDeAcao: true,
  });

  if (!contrato) return null;

  const dias = diasRestantes(contrato.dataTermino);
  const faixa = classificarFaixa(contrato);
  const faixaMeta = FAIXA_META[faixa];
  const progressoGeral = Math.round(
    (contrato.fluxo.filter((f) => f.status === "concluida").length / FLOW_STAGES.length) * 100
  );

  function abrirEdicao() {
    if (!contrato) return;
    setForm({
      responsavelAtual: contrato.responsavelAtual,
      observacaoStatus: contrato.observacaoStatus ?? "",
      fiscal: contrato.fiscal,
      temPlanoDeAcao: contrato.temPlanoDeAcao,
    });
    setEditOpen(true);
  }

  function salvarEdicao() {
    if (!contrato) return;
    atualizarContrato(contrato.id, {
      responsavelAtual: form.responsavelAtual,
      observacaoStatus: form.observacaoStatus,
      fiscal: form.fiscal,
      temPlanoDeAcao: form.temPlanoDeAcao,
    });
    toast.success(`Contrato ${contrato.numero} atualizado com sucesso.`);
    setEditOpen(false);
  }

  return (
    <>
      <Sheet
        open={painelAberto}
        onOpenChange={(v) => {
          if (!v) fecharPainelContrato();
        }}
      >
        <SheetContent className="w-full p-0 sm:max-w-xl">
          <SheetHeader>
            <div className="flex items-start justify-between gap-3 pr-8">
              <div>
                <SheetTitle className="text-lg">Contrato {contrato.numero}</SheetTitle>
                <SheetDescription className="mt-0.5 flex items-center gap-1.5">
                  <Building2 className="size-3.5" /> {contrato.empresa}
                </SheetDescription>
              </div>
              <Badge variant={faixa === "zona-critica" ? "danger" : faixa === "atencao" ? "warning" : faixa === "meta-batida" ? "success" : "info"}>
                {faixaMeta.label}
              </Badge>
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1" viewportClassName="px-6 py-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="card-surface col-span-1 flex flex-col items-center justify-center rounded-xl py-3">
                <span className={cn("text-2xl font-extrabold", faixaMeta.corTexto)}>{dias}</span>
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">dias restantes</span>
              </div>
              <div className="card-surface col-span-2 flex flex-col justify-center rounded-xl px-4 py-3">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Valor do contrato</span>
                <span className="text-lg font-bold">{formatarMoeda(contrato.valor)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso do fluxo de prorrogação</span>
              <span className="font-semibold text-foreground">{progressoGeral}%</span>
            </div>
            <Progress value={progressoGeral} className="mt-1.5" />

            <Tabs value={tab} onValueChange={setTab} className="mt-5">
              <TabsList className="w-full">
                <TabsTrigger value="geral">Visão Geral</TabsTrigger>
                <TabsTrigger value="etapas">Etapas</TabsTrigger>
                <TabsTrigger value="historico">Histórico</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="geral" className="space-y-4">
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <InfoRow label="Objeto" value={contrato.objeto} />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Fiscal" value={contrato.fiscal} icon={User} />
                    <InfoRow label="Fiscal substituto" value={contrato.fiscalSubstituto ?? "—"} icon={User} />
                  </div>
                  <InfoRow label="CNPJ" value={contrato.cnpj} />
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Início da vigência" value={formatarData(contrato.dataInicio)} icon={Calendar} />
                    <InfoRow label="Término da vigência" value={formatarData(contrato.dataTermino)} icon={Calendar} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <InfoRow label="Status" value={STATUS_LABEL[contrato.status]} />
                    <InfoRow label="Plano de ação" value={contrato.temPlanoDeAcao ? "Ativo" : "Não definido"} />
                  </div>
                  <InfoRow label="Responsável atual" value={contrato.responsavelAtual} icon={User} />
                  <InfoRow
                    label="Última movimentação"
                    value={`${formatarData(contrato.ultimaMovimentacao)} — ${contrato.ultimaMovimentacaoDescricao}`}
                    icon={Clock}
                  />
                  <div className="flex items-center justify-between gap-2 rounded-xl border border-border/70 bg-accent/30 px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Processo SEI</p>
                      <p className="truncate font-mono text-sm font-medium">{contrato.processoSEI}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setSeiOpen(true)}>
                      <ExternalLink className="size-3.5" /> Abrir
                    </Button>
                  </div>
                </dl>
              </TabsContent>

              <TabsContent value="etapas" className="space-y-1">
                {contrato.fluxo.map((estado, i) => {
                  const stage = FLOW_STAGES.find((s) => s.id === estado.stageId)!;
                  const isLast = i === contrato.fluxo.length - 1;
                  return (
                    <div key={estado.stageId} className="relative flex gap-3 pb-5 last:pb-0">
                      {!isLast && (
                        <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
                      )}
                      <span className={cn("relative mt-1.5 size-3.5 shrink-0 rounded-full ring-4 ring-background", STAGE_STATUS_DOT[estado.status])} />
                      <div className="min-w-0 flex-1 pb-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{stage.nome}</p>
                          {estado.status !== "nao-iniciada" && estado.status !== "proxima" && (
                            <span className="text-xs font-medium text-muted-foreground">{estado.diasNaEtapa}d</span>
                          )}
                        </div>
                        {estado.status !== "nao-iniciada" && estado.status !== "proxima" ? (
                          <>
                            <p className="text-xs text-muted-foreground">{estado.responsavel}</p>
                            <p className="text-[11px] text-muted-foreground/70">
                              {estado.ultimaMovimentacao && formatarData(estado.ultimaMovimentacao)}
                            </p>
                            <Progress value={estado.percentualConcluido} className="mt-1.5 h-1.5" />
                          </>
                        ) : (
                          <p className="text-xs text-muted-foreground/60">
                            {estado.status === "proxima" ? "Próxima etapa" : "Ainda não iniciada"}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </TabsContent>

              <TabsContent value="historico">
                <ol className="space-y-4">
                  {contrato.historico.map((h, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <ScrollText className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium">{h.evento}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatarData(h.data)} · {h.autor}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </TabsContent>

              <TabsContent value="documentos" className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Documentos
                  </p>
                  <div className="space-y-1.5">
                    {contrato.documentos.map((doc, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 rounded-lg border border-border/60 px-3 py-2 text-sm"
                      >
                        <FileText className="size-4 shrink-0 text-muted-foreground" />
                        <span className="min-w-0 flex-1 truncate">{doc.nome}</span>
                        <Badge variant={doc.status === "entregue" ? "success" : "warning"} className="shrink-0">
                          {doc.status === "entregue" ? "Entregue" : "Pendente"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Checklist
                  </p>
                  <div className="space-y-1.5">
                    {contrato.checklist.map((item, i) => (
                      <div key={i} className="flex items-center gap-2.5 text-sm">
                        {item.concluido ? (
                          <CheckCircle2 className="size-4 shrink-0 text-success" />
                        ) : (
                          <Circle className="size-4 shrink-0 text-muted-foreground/40" />
                        )}
                        <span className={item.concluido ? "" : "text-muted-foreground"}>{item.item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>

          <SheetFooter className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="outline" size="sm" onClick={abrirEdicao}>
              <Pencil className="size-3.5" /> Editar
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSeiOpen(true)}>
              <ExternalLink className="size-3.5" /> Processo
            </Button>
            <Button variant="outline" size="sm" onClick={() => setTab("documentos")}>
              <FileText className="size-3.5" /> Documentos
            </Button>
            <Button size="sm" onClick={() => window.print()}>
              <FileDown className="size-3.5" /> Exportar PDF
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar contrato {contrato.numero}</DialogTitle>
            <DialogDescription>Atualize as informações de acompanhamento do contrato.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="fiscal">Fiscal</Label>
              <Input id="fiscal" value={form.fiscal} onChange={(e) => setForm((f) => ({ ...f, fiscal: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="responsavel">Responsável atual</Label>
              <Input
                id="responsavel"
                value={form.responsavelAtual}
                onChange={(e) => setForm((f) => ({ ...f, responsavelAtual: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="obs">Observação de status</Label>
              <Textarea
                id="obs"
                value={form.observacaoStatus}
                onChange={(e) => setForm((f) => ({ ...f, observacaoStatus: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
              <div>
                <Label htmlFor="plano">Plano de ação ativo</Label>
                <p className="text-xs text-muted-foreground">Necessário para contratos em Zona Crítica</p>
              </div>
              <Switch
                id="plano"
                checked={form.temPlanoDeAcao}
                onCheckedChange={(v) => setForm((f) => ({ ...f, temPlanoDeAcao: v }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarEdicao}>Salvar alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={seiOpen} onOpenChange={setSeiOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Processo SEI</DialogTitle>
            <DialogDescription>
              Utilize o número abaixo para localizar o processo no sistema SEI do seu órgão.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-between gap-2 rounded-xl border border-border bg-accent/30 px-4 py-3">
            <span className="font-mono text-base font-semibold">{contrato.processoSEI}</span>
            <Button
              size="icon-sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(contrato.processoSEI);
                toast.success("Número do processo copiado.");
              }}
            >
              <Copy className="size-3.5" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InfoRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="flex items-center gap-1.5 text-sm font-medium">
        {Icon && <Icon className="size-3.5 shrink-0 text-muted-foreground" />}
        <span className="truncate">{value}</span>
      </p>
    </div>
  );
}
