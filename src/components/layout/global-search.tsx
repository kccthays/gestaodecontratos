"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Building2, User, Hash, Tag, CalendarClock } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useContractsStore } from "@/store/use-contracts-store";
import { formatarData } from "@/lib/calculations";
import { NAV_ITEMS } from "@/lib/nav-items";

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const router = useRouter();
  const contratos = useContractsStore((s) => s.contratos);
  const abrirPainelContrato = useContractsStore((s) => s.abrirPainelContrato);
  const [query, setQuery] = useState("");

  const resultados = useMemo(() => {
    if (query.trim().length < 1) return contratos.slice(0, 6);
    const q = query.toLowerCase();
    return contratos
      .filter(
        (c) =>
          c.numero.toLowerCase().includes(q) ||
          c.empresa.toLowerCase().includes(q) ||
          c.objeto.toLowerCase().includes(q) ||
          c.fiscal.toLowerCase().includes(q) ||
          c.processoSEI.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q) ||
          String(c.anoExercicio).includes(q)
      )
      .slice(0, 8);
  }, [contratos, query]);

  function selecionar(id: string) {
    onOpenChange(false);
    setQuery("");
    abrirPainelContrato(id);
  }

  function irPara(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Pesquise por contrato, empresa, objeto, fiscal, SEI, status ou ano…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

        {resultados.length > 0 && (
          <CommandGroup heading="Contratos">
            {resultados.map((c) => (
              <CommandItem key={c.id} value={c.id} onSelect={() => selecionar(c.id)}>
                <FileText />
                <div className="flex min-w-0 flex-col">
                  <span className="truncate font-medium">
                    {c.numero} · {c.empresa}
                  </span>
                  <span className="flex items-center gap-2 truncate text-xs text-muted-foreground">
                    <Building2 className="size-3" /> {c.objeto}
                  </span>
                </div>
                <span className="ml-auto flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="size-3" /> {c.fiscal.split(" ")[0]}
                  </span>
                  <span className="flex items-center gap-1">
                    <CalendarClock className="size-3" /> {formatarData(c.dataTermino)}
                  </span>
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        <CommandGroup heading="Navegação">
          {NAV_ITEMS.map((item) => (
            <CommandItem key={item.href} value={`nav-${item.label}`} onSelect={() => irPara(item.href)}>
              <item.icon />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        {query && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Dicas de pesquisa">
              <div className="flex flex-wrap gap-2 px-2 py-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Hash className="size-3" /> número
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="size-3" /> SEI · status · ano
                </span>
              </div>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
