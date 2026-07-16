"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Moon,
  Pencil,
  RotateCcw,
  Save,
  ShieldCheck,
  Sun,
  UploadCloud,
  UserRound,
  X,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useContractsStore } from "@/store/use-contracts-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useUsuarioAtual, usePerfilAtual, usePermissao } from "@/hooks/use-auth";
import { gerarModeloPlanilha } from "@/lib/excel-import";
import { diasRestantes, formatarData, formatarDataLonga, iniciais } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { HOJE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";
import type { InfoInstitucional } from "@/types";

export default function ConfiguracoesPage() {
  const { theme, setTheme } = useTheme();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const mounted = useHasMounted();

  const fonteDados = useContractsStore((s) => s.fonteDados);
  const nomeArquivoImportado = useContractsStore((s) => s.nomeArquivoImportado);
  const ultimaAtualizacao = useContractsStore((s) => s.ultimaAtualizacao);
  const contratos = useContractsStore((s) => s.contratos);
  const importacaoPendente = useContractsStore((s) => s.importacaoPendente);
  const prepararImportacao = useContractsStore((s) => s.prepararImportacao);
  const confirmarImportacao = useContractsStore((s) => s.confirmarImportacao);
  const cancelarImportacao = useContractsStore((s) => s.cancelarImportacao);
  const restaurarDadosExemplo = useContractsStore((s) => s.restaurarDadosExemplo);

  const usuario = useUsuarioAtual();
  const perfil = usePerfilAtual();
  const podeImportar = usePermissao("importar_dados");

  const importMutation = useMutation({
    mutationFn: prepararImportacao,
    onSuccess: () => {
      const pendente = useContractsStore.getState().importacaoPendente;
      if (pendente && pendente.linhasProcessadas > 0) {
        toast.info("Planilha lida. Revise a pré-visualização antes de aplicar.");
      } else {
        toast.error("Não foi possível ler a planilha. Verifique o formato das colunas.");
      }
    },
    onError: () => toast.error("Falha ao processar a planilha."),
  });

  function processarArquivo(file: File | undefined) {
    if (!file) return;
    if (!file.name.match(/\.xlsx?$/i)) {
      toast.error("Envie um arquivo .xlsx ou .xls válido.");
      return;
    }
    importMutation.mutate(file);
  }

  function aplicar() {
    const total = importacaoPendente?.linhasProcessadas ?? 0;
    confirmarImportacao();
    toast.success(`${total} contrato(s) importado(s) com sucesso.`);
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={UserRound}
        title="Configurações"
        description="Preferências do sistema, integração de dados e informações institucionais."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Aparência</CardTitle>
          <CardDescription>Escolha entre tema claro, escuro ou automático.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {[
              { id: "light", label: "Claro", icon: Sun },
              { id: "dark", label: "Escuro", icon: Moon },
              { id: "system", label: "Automático", icon: Database },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                className={cn(
                  "flex flex-1 flex-col items-center gap-1.5 rounded-xl border p-3.5 text-xs font-medium transition-colors",
                  mounted && theme === opt.id ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-accent"
                )}
              >
                <opt.icon className="size-4" />
                {opt.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FileSpreadsheet className="size-4 text-primary" /> Integração de Dados
          </CardTitle>
          <CardDescription>
            Importe a planilha Excel (.xlsx) do setor para atualizar todos os indicadores automaticamente.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Fonte atual dos dados:</span>
            <Badge variant={fonteDados === "importado" ? "success" : "outline"}>
              {fonteDados === "importado" ? `Planilha importada${nomeArquivoImportado ? ` — ${nomeArquivoImportado}` : ""}` : "Dados de exemplo"}
            </Badge>
            <span className="text-muted-foreground">· {contratos.length} contratos · atualizado em {formatarDataLonga(ultimaAtualizacao)}</span>
          </div>

          {!podeImportar ? (
            <div className="flex items-center gap-2.5 rounded-xl border border-dashed border-border bg-surface-solid/40 px-4 py-5 text-sm text-muted-foreground">
              <Lock className="size-4 shrink-0" />
              Seu perfil não possui a permissão “Importar e exportar dados”. Solicite a um
              administrador para atualizar as planilhas.
            </div>
          ) : (
            <>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  processarArquivo(e.dataTransfer.files?.[0]);
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
                  dragOver ? "border-primary bg-primary/5" : "border-border"
                )}
              >
                {importMutation.isPending ? (
                  <Loader2 className="size-7 animate-spin text-primary" />
                ) : (
                  <UploadCloud className="size-7 text-muted-foreground" />
                )}
                <p className="text-sm font-medium">Arraste a planilha aqui ou clique para selecionar</p>
                <p className="text-xs text-muted-foreground">
                  Colunas esperadas: Número, Empresa, Objeto, Fiscal, Valor, Datas, Processo SEI, Etapa
                </p>
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={() => inputRef.current?.click()} disabled={importMutation.isPending}>
                    Selecionar arquivo
                  </Button>
                  <Button size="sm" variant="outline" onClick={gerarModeloPlanilha}>
                    <Download className="size-3.5" /> Baixar modelo
                  </Button>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => processarArquivo(e.target.files?.[0])}
                />
              </div>

              {importacaoPendente && (
                <div className="space-y-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    {importacaoPendente.linhasProcessadas > 0 ? (
                      <CheckCircle2 className="size-3.5 text-success" />
                    ) : (
                      <AlertCircle className="size-3.5 text-danger" />
                    )}
                    Pré-visualização: {importacaoPendente.linhasProcessadas} linha(s) válida(s) ·{" "}
                    {importacaoPendente.linhasIgnoradas} ignorada(s)
                  </p>

                  {importacaoPendente.avisos.length > 0 && (
                    <ul className="ml-5 list-disc space-y-0.5 text-xs text-muted-foreground">
                      {importacaoPendente.avisos.slice(0, 5).map((a, i) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}

                  {importacaoPendente.contratos.length > 0 && (
                    <div className="scrollbar-thin max-h-48 overflow-y-auto rounded-lg border border-border/70 bg-surface-solid/60">
                      <table className="w-full text-xs">
                        <thead className="sticky top-0 bg-accent/60">
                          <tr>
                            <th className="px-2.5 py-1.5 text-left font-semibold">Número</th>
                            <th className="px-2.5 py-1.5 text-left font-semibold">Empresa</th>
                            <th className="px-2.5 py-1.5 text-left font-semibold">Etapa</th>
                            <th className="px-2.5 py-1.5 text-left font-semibold">Vigência até</th>
                            <th className="px-2.5 py-1.5 text-left font-semibold">Dias</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importacaoPendente.contratos.slice(0, 8).map((c) => (
                            <tr key={c.id} className="border-t border-border/50">
                              <td className="px-2.5 py-1.5 font-medium">{c.numero}</td>
                              <td className="max-w-[160px] truncate px-2.5 py-1.5">{c.empresa}</td>
                              <td className="px-2.5 py-1.5">{FLOW_STAGE_MAP[c.etapaAtualId].nome}</td>
                              <td className="px-2.5 py-1.5">{formatarData(c.dataTermino)}</td>
                              <td className="px-2.5 py-1.5">{diasRestantes(c.dataTermino, HOJE)}d</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {importacaoPendente.contratos.length > 8 && (
                        <p className="px-2.5 py-1.5 text-[11px] text-muted-foreground">
                          +{importacaoPendente.contratos.length - 8} outro(s) contrato(s)
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button size="sm" onClick={aplicar} disabled={importacaoPendente.linhasProcessadas === 0}>
                      Aplicar importação
                    </Button>
                    <Button size="sm" variant="outline" onClick={cancelarImportacao}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {fonteDados === "importado" && !importacaoPendente && (
                <Button size="sm" variant="ghost" onClick={restaurarDadosExemplo}>
                  <RotateCcw className="size-3.5" /> Restaurar dados de exemplo
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <InformacoesInstitucionaisCard />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-primary" /> Usuário conectado
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback>{iniciais(usuario?.nome ?? "Usuário")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold">{usuario?.nome}</p>
              <p className="truncate text-xs text-muted-foreground">{usuario?.email}</p>
              <p className="text-xs text-muted-foreground">{usuario?.cargo}</p>
              {perfil && (
                <Badge variant={perfil.sistema ? "danger" : "info"} className="mt-1 gap-1 text-[10px]">
                  <ShieldCheck className="size-3" /> {perfil.nome}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ── Informações institucionais (editáveis com permissão) ────────────────────

function InformacoesInstitucionaisCard() {
  const info = useAuthStore((s) => s.infoInstitucional);
  const atualizarInfoInstitucional = useAuthStore((s) => s.atualizarInfoInstitucional);
  const podeEditar = usePermissao("editar_info_institucional");

  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<InfoInstitucional>(info);

  function abrirEdicao() {
    setForm(info);
    setEditando(true);
  }

  function salvar() {
    if (!form.unidade.trim() || !form.setor.trim()) {
      toast.error("Unidade e setor são obrigatórios.");
      return;
    }
    atualizarInfoInstitucional({
      sistema: form.sistema.trim(),
      secretaria: form.secretaria.trim(),
      unidade: form.unidade.trim(),
      setor: form.setor.trim(),
      estado: form.estado.trim(),
      cidade: form.cidade.trim(),
    });
    setEditando(false);
    toast.success("Informações institucionais atualizadas.");
  }

  const campos: { key: keyof InfoInstitucional; label: string }[] = [
    { key: "sistema", label: "Sistema" },
    { key: "secretaria", label: "Secretaria" },
    { key: "unidade", label: "Unidade" },
    { key: "setor", label: "Setor" },
    { key: "cidade", label: "Cidade" },
    { key: "estado", label: "Estado" },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Landmark className="size-4 text-primary" /> Informações institucionais
          </CardTitle>
          {podeEditar && !editando && (
            <Button variant="ghost" size="icon-sm" onClick={abrirEdicao} aria-label="Editar">
              <Pencil />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5 text-sm">
        {editando ? (
          <div className="space-y-3">
            {campos.map((campo) => (
              <div key={campo.key} className="space-y-1">
                <Label htmlFor={`info-${campo.key}`} className="text-xs text-muted-foreground">
                  {campo.label}
                </Label>
                <Input
                  id={`info-${campo.key}`}
                  value={form[campo.key]}
                  onChange={(e) => setForm((f) => ({ ...f, [campo.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={salvar}>
                <Save className="size-3.5" /> Salvar
              </Button>
              <Button size="sm" variant="outline" onClick={() => setEditando(false)}>
                <X className="size-3.5" /> Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p>
              <span className="text-muted-foreground">Sistema:</span> {info.sistema}
            </p>
            <p>
              <span className="text-muted-foreground">Secretaria:</span> {info.secretaria}
            </p>
            <p>
              <span className="text-muted-foreground">Unidade:</span> {info.unidade}
            </p>
            <p>
              <span className="text-muted-foreground">Setor:</span> {info.setor}
            </p>
            <p className="flex items-center gap-1.5">
              <MapPin className="size-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">Cidade/UF:</span> {info.cidade} — {info.estado}
            </p>
            {!podeEditar && (
              <p className="flex items-center gap-1.5 pt-1 text-xs text-muted-foreground/80">
                <Building2 className="size-3.5" /> Somente administradores e gestores podem editar
                estes dados.
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
