"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  BadgeCheck,
  Building2,
  Check,
  KeyRound,
  Mail,
  Save,
  ShieldCheck,
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
import { useUsuarioAtual, usePerfilAtual } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/use-auth-store";
import { PERMISSOES, perfilTemPermissao } from "@/lib/permissions";
import { formatarData, iniciais } from "@/lib/calculations";

export default function PerfilPage() {
  const usuario = useUsuarioAtual();
  const perfil = usePerfilAtual();
  const atualizarMeuPerfil = useAuthStore((s) => s.atualizarMeuPerfil);
  const alterarSenha = useAuthStore((s) => s.alterarSenha);

  const [form, setForm] = useState({
    nome: usuario?.nome ?? "",
    cargo: usuario?.cargo ?? "",
    email: usuario?.email ?? "",
    setor: usuario?.setor ?? "",
  });

  const [senhas, setSenhas] = useState({ atual: "", nova: "", confirmar: "" });

  if (!usuario) return null;

  function salvarDados() {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    atualizarMeuPerfil({
      nome: form.nome.trim(),
      cargo: form.cargo.trim(),
      email: form.email.trim(),
      setor: form.setor.trim(),
    });
    toast.success("Perfil atualizado com sucesso.");
  }

  function salvarSenha() {
    if (senhas.nova !== senhas.confirmar) {
      toast.error("A confirmação não corresponde à nova senha.");
      return;
    }
    const erro = alterarSenha(senhas.atual, senhas.nova);
    if (erro) {
      toast.error(erro);
      return;
    }
    toast.success("Senha alterada com sucesso.");
    setSenhas({ atual: "", nova: "", confirmar: "" });
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={UserRound}
        title="Meu perfil"
        description="Seus dados de acesso, cargo e permissões no sistema."
      />

      <Card>
        <CardContent className="flex flex-col items-center gap-4 pt-6 sm:flex-row sm:items-center">
          <Avatar className="size-20 text-2xl">
            <AvatarFallback>{iniciais(usuario.nome)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-lg font-bold">{usuario.nome}</h2>
            <p className="text-sm text-muted-foreground">{usuario.cargo}</p>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {perfil && (
                <Badge variant={perfil.sistema ? "danger" : "info"} className="gap-1">
                  <ShieldCheck className="size-3" /> {perfil.nome}
                </Badge>
              )}
              <Badge variant={usuario.ativo ? "success" : "secondary"}>
                {usuario.ativo ? "Ativo" : "Inativo"}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Desde {formatarData(usuario.criadoEm)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Dados pessoais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BadgeCheck className="size-4 text-primary" /> Dados pessoais
            </CardTitle>
            <CardDescription>Atualize suas informações de identificação.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nome">Nome completo</Label>
              <Input
                id="nome"
                value={form.nome}
                onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cargo">Cargo / função</Label>
              <Input
                id="cargo"
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">
                <Mail className="size-3.5" /> E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="setor">
                <Building2 className="size-3.5" /> Setor
              </Label>
              <Input
                id="setor"
                value={form.setor}
                onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))}
              />
            </div>
            <Button onClick={salvarDados} className="w-full sm:w-auto">
              <Save className="size-4" /> Salvar alterações
            </Button>
          </CardContent>
        </Card>

        {/* Segurança */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <KeyRound className="size-4 text-primary" /> Segurança
            </CardTitle>
            <CardDescription>Altere a senha usada para acessar o sistema.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="senha-atual">Senha atual</Label>
              <Input
                id="senha-atual"
                type="password"
                autoComplete="current-password"
                value={senhas.atual}
                onChange={(e) => setSenhas((s) => ({ ...s, atual: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha-nova">Nova senha</Label>
              <Input
                id="senha-nova"
                type="password"
                autoComplete="new-password"
                value={senhas.nova}
                onChange={(e) => setSenhas((s) => ({ ...s, nova: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="senha-confirmar">Confirmar nova senha</Label>
              <Input
                id="senha-confirmar"
                type="password"
                autoComplete="new-password"
                value={senhas.confirmar}
                onChange={(e) => setSenhas((s) => ({ ...s, confirmar: e.target.value }))}
              />
            </div>
            <Button
              onClick={salvarSenha}
              variant="outline"
              className="w-full sm:w-auto"
              disabled={!senhas.atual || !senhas.nova || !senhas.confirmar}
            >
              <KeyRound className="size-4" /> Alterar senha
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Permissões do perfil */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-4 text-primary" /> O que você pode fazer
          </CardTitle>
          <CardDescription>
            Permissões concedidas pelo perfil{" "}
            <span className="font-medium text-foreground">{perfil?.nome}</span>. Para alterar seu
            nível de acesso, contate um administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PERMISSOES.map((permissao) => {
              const concedida = perfilTemPermissao(perfil, permissao.key);
              return (
                <div
                  key={permissao.key}
                  className="flex items-start gap-2.5 rounded-lg border border-border/60 px-3 py-2"
                >
                  <span
                    className={
                      concedida
                        ? "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-success-soft text-success"
                        : "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-muted-foreground dark:bg-slate-800"
                    }
                  >
                    {concedida ? <Check className="size-3" /> : <X className="size-3" />}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={
                        concedida
                          ? "text-sm font-medium"
                          : "text-sm font-medium text-muted-foreground line-through decoration-muted-foreground/40"
                      }
                    >
                      {permissao.label}
                    </p>
                    <p className="text-xs text-muted-foreground">{permissao.descricao}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
