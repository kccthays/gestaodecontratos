"use client";

import { create } from "zustand";
import { format } from "date-fns";
import type { CalendarEvent, Contract, Penalty } from "@/types";
import { gerarDatasetMock } from "@/lib/mock-data";
import { parseContractsWorkbook } from "@/lib/excel-import";

const datasetInicial = gerarDatasetMock();

export interface ImportacaoPendente {
  nomeArquivo: string;
  contratos: Contract[];
  avisos: string[];
  linhasProcessadas: number;
  linhasIgnoradas: number;
}

interface ContractsState {
  contratos: Contract[];
  penalidades: Penalty[];
  eventos: CalendarEvent[];
  streakDesde: string;
  ultimaAtualizacao: string;
  fonteDados: "exemplo" | "importado";
  nomeArquivoImportado: string | null;

  painelContratoId: string | null;
  painelAberto: boolean;

  importacaoPendente: ImportacaoPendente | null;

  abrirPainelContrato: (id: string) => void;
  fecharPainelContrato: () => void;
  prepararImportacao: (file: File) => Promise<void>;
  confirmarImportacao: () => void;
  cancelarImportacao: () => void;
  restaurarDadosExemplo: () => void;
  atualizarContrato: (id: string, patch: Partial<Contract>) => void;
}

export const useContractsStore = create<ContractsState>((set, get) => ({
  contratos: datasetInicial.contratos,
  penalidades: datasetInicial.penalidades,
  eventos: datasetInicial.eventos,
  streakDesde: datasetInicial.streakDesde,
  ultimaAtualizacao: datasetInicial.ultimaAtualizacao,
  fonteDados: "exemplo",
  nomeArquivoImportado: null,

  painelContratoId: null,
  painelAberto: false,

  importacaoPendente: null,

  abrirPainelContrato: (id) => set({ painelContratoId: id, painelAberto: true }),
  fecharPainelContrato: () => set({ painelAberto: false }),

  prepararImportacao: async (file) => {
    set({ importacaoPendente: null });
    const resultado = await parseContractsWorkbook(file);
    set({
      importacaoPendente: {
        nomeArquivo: file.name,
        contratos: resultado.contratos,
        avisos: resultado.avisos,
        linhasProcessadas: resultado.linhasProcessadas,
        linhasIgnoradas: resultado.linhasIgnoradas,
      },
    });
  },

  confirmarImportacao: () => {
    const pendente = get().importacaoPendente;
    if (!pendente || pendente.contratos.length === 0) return;
    set({
      contratos: pendente.contratos,
      fonteDados: "importado",
      nomeArquivoImportado: pendente.nomeArquivo,
      ultimaAtualizacao: format(new Date(), "yyyy-MM-dd"),
      importacaoPendente: null,
    });
  },

  cancelarImportacao: () => set({ importacaoPendente: null }),

  restaurarDadosExemplo: () => {
    const dataset = gerarDatasetMock();
    set({
      contratos: dataset.contratos,
      penalidades: dataset.penalidades,
      eventos: dataset.eventos,
      streakDesde: dataset.streakDesde,
      ultimaAtualizacao: dataset.ultimaAtualizacao,
      fonteDados: "exemplo",
      nomeArquivoImportado: null,
      importacaoPendente: null,
    });
  },

  atualizarContrato: (id, patch) =>
    set((state) => ({
      contratos: state.contratos.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    })),
}));

export function useContratoSelecionado(): Contract | null {
  const painelContratoId = useContractsStore((s) => s.painelContratoId);
  const contratos = useContractsStore((s) => s.contratos);
  if (!painelContratoId) return null;
  return contratos.find((c) => c.id === painelContratoId) ?? null;
}
