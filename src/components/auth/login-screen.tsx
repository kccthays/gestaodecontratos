"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { useAuthStore } from "@/store/use-auth-store";

export function LoginScreen() {
  const login = useAuthStore((s) => s.login);
  const erroLogin = useAuthStore((s) => s.erroLogin);
  const limparErroLogin = useAuthStore((s) => s.limparErroLogin);
  const info = useAuthStore((s) => s.infoInstitucional);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

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

      <div className="glass-strong w-full max-w-md rounded-2xl p-7 shadow-2xl sm:p-9">
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
              placeholder="seu.email@example.com"
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
          {info.setor} · {info.cidade} — {info.estado}
        </p>
      </div>
    </div>
  );
}
