"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { CursorGlow } from "@/components/layout/cursor-glow";
import { GlobalSearch } from "@/components/layout/global-search";
import { ContractDetailPanel } from "@/components/contracts/contract-detail-panel";
import { ContractPrintTemplate } from "@/components/contracts/contract-print-template";
import { ContratoIAWidget } from "@/components/contrato-ia/contrato-ia-widget";
import { useContratoSelecionado } from "@/store/use-contracts-store";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const contratoSelecionado = useContratoSelecionado();
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative min-h-screen">
      <AmbientBackground />
      <CursorGlow />

      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className={cn("flex min-h-screen flex-col transition-all duration-300", collapsed ? "lg:pl-[76px]" : "lg:pl-[264px]")}>
        <Header onOpenSearch={() => setSearchOpen(true)} onToggleMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto w-full max-w-[1600px]"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
        <footer className="px-4 py-4 text-center text-[11px] text-muted-foreground/70 sm:px-6">
          SIGC — Sistema Inteligente de Gestão de Contratos · Secretaria de Serviços Compartilhados
        </footer>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <ContractDetailPanel />
      <ContractPrintTemplate contract={contratoSelecionado} />
      <ContratoIAWidget />
    </div>
  );
}
