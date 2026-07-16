"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { ShieldCheck } from "lucide-react";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AmbientBackground } from "@/components/layout/ambient-background";
import { CursorGlow } from "@/components/layout/cursor-glow";
import { GlobalSearch } from "@/components/layout/global-search";
import { ContractDetailPanel } from "@/components/contracts/contract-detail-panel";
import { ContractPrintTemplate } from "@/components/contracts/contract-print-template";
import { ContratoIAWidget } from "@/components/contrato-ia/contrato-ia-widget";
import { LoginScreen } from "@/components/auth/login-screen";
import { useContratoSelecionado } from "@/store/use-contracts-store";
import { useAuthStore } from "@/store/use-auth-store";
import { useUsuarioAtual } from "@/hooks/use-auth";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { cn } from "@/lib/utils";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const contratoSelecionado = useContratoSelecionado();
  const pathname = usePathname();
  const mounted = useHasMounted();
  const usuarioAtual = useUsuarioAtual();
  const info = useAuthStore((s) => s.infoInstitucional);

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

  // Evita divergência de hidratação: só decidimos entre login e app após montar,
  // quando o estado de acesso persistido já foi carregado do localStorage.
  if (!mounted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center">
        <AmbientBackground />
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg">
            <ShieldCheck className="size-6 animate-pulse text-white" strokeWidth={2.25} />
          </div>
          <span className="text-xs">Carregando…</span>
        </div>
      </div>
    );
  }

  if (!usuarioAtual) {
    return <LoginScreen />;
  }

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
          SIGC · {info.secretaria} · {info.unidade} · {info.cidade}/MS
        </footer>
      </div>

      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
      <ContractDetailPanel />
      <ContractPrintTemplate contract={contratoSelecionado} />
      <ContratoIAWidget />
    </div>
  );
}
