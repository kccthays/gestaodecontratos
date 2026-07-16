"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { useAuthStore } from "@/store/use-auth-store";
import { iniciais } from "@/lib/calculations";

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const erroLogin = useAuthStore((s) => s.erroLogin);
  const limparErroLogin = useAuthStore((s) => s.limparErroLogin);
  const usuarios = useAuthStore((s) => s.usuarios);
  const perfis = useAuthStore((s) => s.perfis);
  const info = useAuthStore((s) => s.infoInstitucional);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  function nomePerfil(perfilId: string) {
    return perfis.find((p) => p.id === perfilId)?.nome ?? "—";
  }

  function preencher(emailConta: string, senhaConta: string) {
    setEmail(emailConta);
    setSenha(senhaConta);
    limparErroLogin();
  }

  function entrar(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Informe e-mail e senha.");
      return;
    }
    const ok = login(email, senha);
    if (ok) {
      const nome = useAuthStore
        .getState()
        .usuarios.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())?.nome;
      toast.success(`Bem-vindo(a)${nome ? `, ${nome.split(" ")[0]}` : ""}!`);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <AmbientBackground />

      <div className="grid w-full max-w-4xl gap-6 lg:grid-cols-[1.05fr_1fr]">
        {/* Painel de acesso */}
        <div className="glass-strong flex flex-col justify-center rounded-2xl p-7 shadow-2xl sm:p-9">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-900/40">
              <ShieldCheck className="size-6 text-white" strokeWidth={2.25} />
            </div>
            <div>
              <p className="text-gradient text-lg font-extrabold tracking-tight">SIGC</p>
              <p className="text-[11px] leading-tight text-muted-foreground">
                Sistema Inteligente de Gestão de Contratos
              </p>
            </div>
          </div>

          <h1 className="text-xl font-bold tracking-tight">Acesse sua conta</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Entre com seu login para gerenciar os contratos e as informações do sistema.
          </p>

          <form onSubmit={entrar} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="seu.email@sra.ms.gov.br"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (erroLogin) limparErroLogin();
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="senha">Senha</Label>
              <div className="relative">
                <Input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={senha}
                  onChange={(e) => {
                    setSenha(e.target.value);
                    if (erroLogin) limparErroLogin();
                  }}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            {erroLogin && (
              <p className="rounded-lg bg-danger-soft px-3 py-2 text-xs font-medium text-danger">
                {erroLogin}
              </p>
            )}

            <Button type="submit" variant="institutional" className="w-full" size="lg">
              <LogIn className="size-4" /> Entrar
            </Button>
          </form>

          <p className="mt-5 text-center text-[11px] leading-relaxed text-muted-foreground/80">
            {info.unidade}
            <br />
            {info.setor} · {info.cidade}/MS
          </p>
        </div>

        {/* Contas de demonstração */}
        <div className="glass flex flex-col rounded-2xl p-6 shadow-xl">
          <p className="text-sm font-semibold">Contas de demonstração</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ambiente de teste — clique em uma conta para preencher e testar cada nível de permissão.
          </p>

          <div className="scrollbar-thin mt-4 flex-1 space-y-2 overflow-y-auto pr-1">
            {usuarios.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => preencher(u.email, u.senha)}
                disabled={!u.ativo}
                className="flex w-full items-center gap-3 rounded-xl border border-border/70 bg-surface-solid/50 p-2.5 text-left transition-colors hover:border-ring/50 hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-xs font-semibold text-white">
                  {iniciais(u.nome)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold">{u.nome}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{u.email}</p>
                </div>
                <Badge variant={u.ativo ? "outline" : "secondary"} className="shrink-0 text-[10px]">
                  {u.ativo ? nomePerfil(u.perfilId) : "Inativo"}
                </Badge>
              </button>
            ))}
          </div>

          <p className="mt-3 rounded-lg bg-info-soft/60 px-3 py-2 text-[11px] text-info">
            Senha do administrador: <span className="font-mono font-semibold">admin123</span> · demais
            contas: <span className="font-mono font-semibold">sigc123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
