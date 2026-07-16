"use client";

import { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronsLeft, ChevronsRight, LifeBuoy, ShieldCheck } from "lucide-react";

import { NAV_ITEMS } from "@/lib/nav-items";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePerfilAtual } from "@/hooks/use-auth";
import { perfilTemPermissao } from "@/lib/permissions";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ collapsed, onToggle, mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const perfil = usePerfilAtual();

  const itensVisiveis = useMemo(
    () =>
      NAV_ITEMS.filter(
        (item) =>
          !item.permissoes ||
          item.permissoes.some((p) => perfilTemPermissao(perfil, p))
      ),
    [perfil]
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out",
          "border-r border-white/5 shadow-2xl",
          collapsed ? "w-[76px]" : "w-[264px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="relative flex h-16 shrink-0 items-center gap-3 border-b border-white/8 px-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-900/40">
            <ShieldCheck className="size-5 text-white" strokeWidth={2.25} />
          </div>
          {!collapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-bold tracking-wide text-white">SIGC</span>
              <span className="truncate text-[10.5px] leading-tight text-blue-200/70">
                Gestão Inteligente de Contratos
              </span>
            </div>
          )}
          <button
            onClick={onToggle}
            className="ml-auto hidden size-7 shrink-0 items-center justify-center rounded-lg text-blue-200/60 transition-colors hover:bg-white/10 hover:text-white lg:flex"
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
          >
            {collapsed ? <ChevronsRight className="size-4" /> : <ChevronsLeft className="size-4" />}
          </button>
        </div>

        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {itensVisiveis.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-gradient-to-r from-blue-500/25 to-blue-500/5 text-white"
                    : "text-blue-100/65 hover:bg-white/6 hover:text-white"
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active-bar"
                    className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-blue-400 shadow-[0_0_12px_2px_rgba(75,139,240,0.7)]"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <item.icon className={cn("size-[18px] shrink-0", active && "text-blue-300")} strokeWidth={2} />
                {!collapsed && <span className="truncate">{item.label}</span>}
                {!collapsed && item.badge && (
                  <span className="ml-auto rounded-full bg-blue-400/20 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-blue-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.href}>
                  <TooltipTrigger asChild>{link}</TooltipTrigger>
                  <TooltipContent side="right">{item.label}</TooltipContent>
                </Tooltip>
              );
            }
            return link;
          })}
        </nav>

        <div className="border-t border-white/8 p-3">
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-blue-100/60 transition-colors hover:bg-white/6 hover:text-white",
              collapsed && "justify-center"
            )}
          >
            <LifeBuoy className="size-[18px] shrink-0" strokeWidth={2} />
            {!collapsed && <span>Central de Ajuda</span>}
          </a>
        </div>
      </aside>
    </>
  );
}
