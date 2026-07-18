"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  AlertTriangle,
  FileCheck2,
  ShieldAlert,
  Settings,
  LogOut,
  UserRound,
  ShieldCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useContractsStore } from "@/store/use-contracts-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useUsuarioAtual, usePerfilAtual } from "@/hooks/use-auth";
import { contratosEmRiscoProximos30Dias } from "@/lib/flow-calculations";
import { formatarDataLonga, iniciais } from "@/lib/calculations";
import { useHasMounted } from "@/hooks/use-has-mounted";

interface HeaderProps {
  onOpenSearch: () => void;
  onToggleMobileSidebar: () => void;
}

interface Notificacao {
  id: string;
  icon: typeof AlertTriangle;
  cor: string;
  titulo: string;
  descricao: string;
  contratoId?: string;
}

export function Header({ onOpenSearch, onToggleMobileSidebar }: HeaderProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useHasMounted();
  const contratos = useContractsStore((s) => s.contratos);
  const ultimaAtualizacao = useContractsStore((s) => s.ultimaAtualizacao);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const info = useAuthStore((s) => s.infoInstitucional);
  const logout = useAuthStore((s) => s.logout);
  const usuario = useUsuarioAtual();
  const perfil = usePerfilAtual();

  const nomeUsuario = usuario?.nome ?? "Usuário";
  const cargoUsuario = usuario?.cargo ?? "";

  const notificacoes = useMemo(() => {
    const emRisco = contratosEmRiscoProximos30Dias(contratos).slice(0, 3);
    const base: Notificacao[] = [
      {
        id: "n-pub",
        icon: FileCheck2,
        cor: "text-success",
        titulo: "Termo Aditivo publicado",
        descricao: "Contrato concluído com folga na antecedência.",
      },
      {
        id: "n-pen",
        icon: ShieldAlert,
        cor: "text-warning",
        titulo: "Novo processo de penalidade",
        descricao: "Processo sancionador recém instaurado aguarda triagem.",
      },
    ];
    const riscos: Notificacao[] = emRisco.map((c) => ({
      id: `n-${c.id}`,
      icon: AlertTriangle,
      cor: "text-danger",
      titulo: `Contrato ${c.numero} se aproxima do vencimento`,
      descricao: c.empresa,
      contratoId: c.id,
    }));
    return [...riscos, ...base];
  }, [contratos]);

  return (
    <header className="glass sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b px-4 sm:px-6">
      <button
        onClick={onToggleMobileSidebar}
        className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="size-5" />
      </button>

      <div className="hidden min-w-0 flex-col justify-center leading-tight sm:flex">
        <div className="flex items-baseline gap-2">
          <span className="text-gradient text-base font-extrabold tracking-tight">SIGC</span>
          <span className="hidden truncate text-xs text-muted-foreground md:inline">
            Sistema Inteligente de Gestão de Contratos
          </span>
        </div>
        <span className="truncate text-[11px] text-muted-foreground/80">
          {info.unidade} · {info.setor} · {info.cidade} — {info.estado}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenSearch}
          className="hidden items-center gap-2 rounded-lg border border-border bg-surface-solid/50 px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:border-ring/50 hover:text-foreground sm:flex"
        >
          <Search className="size-3.5" />
          <span className="pr-2">Pesquisar…</span>
        </button>
        <Button variant="ghost" size="icon" className="sm:hidden" onClick={onOpenSearch} aria-label="Pesquisar">
          <Search className="size-4.5" />
        </Button>

        <div className="mx-1 hidden flex-col items-end text-right lg:flex">
          <span className="text-[10px] uppercase tracking-wide text-muted-foreground">Última atualização</span>
          <span className="text-xs font-medium text-foreground">{formatarDataLonga(ultimaAtualizacao)}</span>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notificações">
              <Bell className="size-4.5" />
              {notificacoes.length > 0 && (
                <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-danger ring-2 ring-background" />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="border-b border-border/70 px-4 py-3">
              <p className="text-sm font-semibold">Notificações</p>
              <p className="text-xs text-muted-foreground">{notificacoes.length} atualizações recentes</p>
            </div>
            <div className="scrollbar-thin max-h-80 overflow-y-auto p-2">
              {notificacoes.map((n) => (
                <button
                  key={n.id}
                  onClick={() => n.contratoId && abrirPainelContrato(n.contratoId)}
                  className="flex w-full items-start gap-3 rounded-lg px-2.5 py-2.5 text-left transition-colors hover:bg-accent"
                >
                  <n.icon className={`mt-0.5 size-4 shrink-0 ${n.cor}`} />
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">{n.titulo}</p>
                    <p className="truncate text-xs text-muted-foreground">{n.descricao}</p>
                  </div>
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Alternar tema"
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
          {mounted && resolvedTheme === "dark" ? <Sun className="size-4.5" /> : <Moon className="size-4.5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-0.5 flex items-center gap-2 rounded-full p-0.5 pr-1 transition-colors hover:bg-accent sm:pr-2.5">
              <Avatar className="size-8">
                <AvatarFallback>{iniciais(nomeUsuario)}</AvatarFallback>
              </Avatar>
              <div className="hidden flex-col items-start leading-tight sm:flex">
                <span className="text-xs font-semibold">{nomeUsuario}</span>
                <span className="text-[10.5px] text-muted-foreground">{cargoUsuario}</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">{nomeUsuario}</span>
              <span className="text-xs font-normal text-muted-foreground">{usuario?.email}</span>
              {perfil && (
                <Badge variant={perfil.sistema ? "danger" : "outline"} className="mt-1 w-fit gap-1 text-[10px]">
                  <ShieldCheck className="size-3" /> {perfil.nome}
                </Badge>
              )}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/perfil">
                <UserRound /> Meu perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/configuracoes">
                <Settings /> Configurações
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
