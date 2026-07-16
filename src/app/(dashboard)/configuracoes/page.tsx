"use client";

import { useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Database,
  Download,
  FileSpreadsheet,
  Landmark,
  Loader2,
  Moon,
  RotateCcw,
  Sun,
  UploadCloud,
  UserRound,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useContractsStore } from "@/store/use-contracts-store";
import { gerarModeloPlanilha } from "@/lib/excel-import";
import { diasRestantes, formatarData, formatarDataLonga, iniciais } from "@/lib/calculations";
import { FLOW_STAGE_MAP } from "@/lib/flow-stages";
import { HOJE } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { useHasMounted } from "@/hooks/use-has-mounted";

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
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Landmark className="size-4 text-primary" /> Informações institucionais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            <p>
              <span className="text-muted-foreground">Sistema:</span> SIGC — Sistema Inteligente de Gestão de Contratos
            </p>
            <p>
              <span className="text-muted-foreground">Secretaria:</span> Secretaria de Serviços Compartilhados
            </p>
            <p>
              <span className="text-muted-foreground">Unidade:</span> Superintendência Regional de Administração
            </p>
            <p>
              <span className="text-muted-foreground">Estado:</span> Bahia
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <UserRound className="size-4 text-primary" /> Usuário conectado
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Avatar className="size-11">
              <AvatarFallback>{iniciais("Thayssa Kerollyn")}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-semibold">Thayssa Kerollyn</p>
              <p className="text-xs text-muted-foreground">thayssakerollyn@gmail.com</p>
              <p className="text-xs text-muted-foreground">Coordenação de Contratos</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
