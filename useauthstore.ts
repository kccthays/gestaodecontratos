"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { format } from "date-fns";
import type {
  InfoInstitucional,
  PerfilAcesso,
  PermissionKey,
  Usuario,
} from "@/types";
import {
  INFO_INSTITUCIONAL_PADRAO,
  PERFIS_PADRAO,
  USUARIOS_PADRAO,
} from "@/lib/permissions";

function novoId(prefixo: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefixo}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefixo}-${Math.random().toString(36).slice(2, 10)}`;
}

interface AuthState {
  usuarioAtualId: string | null;
  usuarios: Usuario[];
  perfis: PerfilAcesso[];
  infoInstitucional: InfoInstitucional;
  erroLogin: string | null;

  login: (email: string, senha: string) => boolean;
  logout: () => void;
  limparErroLogin: () => void;

  atualizarMeuPerfil: (patch: Partial<Usuario>) => void;
  alterarSenha: (atual: string, nova: string) => string | null;

  criarUsuario: (dados: Omit<Usuario, "id" | "criadoEm">) => void;
  atualizarUsuario: (id: string, patch: Partial<Usuario>) => void;
  alternarUsuarioAtivo: (id: string) => void;
  removerUsuario: (id: string) => string | null;

  criarPerfil: (dados: Omit<PerfilAcesso, "id">) => void;
  atualizarPerfil: (id: string, patch: Partial<PerfilAcesso>) => void;
  togglePermissao: (perfilId: string, permissao: PermissionKey) => void;
  removerPerfil: (id: string) => string | null;

  atualizarInfoInstitucional: (patch: Partial<InfoInstitucional>) => void;
  restaurarPadroes: () => void;
}

const safeStorage = createJSONStorage(() => {
  if (typeof window === "undefined") {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
    };
  }
  return window.localStorage;
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuarioAtualId: null,
      usuarios: USUARIOS_PADRAO,
      perfis: PERFIS_PADRAO,
      infoInstitucional: INFO_INSTITUCIONAL_PADRAO,
      erroLogin: null,

      login: (email, senha) => {
        const alvo = email.trim().toLowerCase();
        const usuario = get().usuarios.find(
          (u) => u.email.toLowerCase() === alvo
        );
        if (!usuario) {
          set({ erroLogin: "E-mail não encontrado." });
          return false;
        }
        if (!usuario.ativo) {
          set({ erroLogin: "Usuário inativo. Contate um administrador." });
          return false;
        }
        if (usuario.senha !== senha) {
          set({ erroLogin: "Senha incorreta." });
          return false;
        }
        set({ usuarioAtualId: usuario.id, erroLogin: null });
        return true;
      },

      logout: () => set({ usuarioAtualId: null, erroLogin: null }),
      limparErroLogin: () => set({ erroLogin: null }),

      atualizarMeuPerfil: (patch) => {
        const id = get().usuarioAtualId;
        if (!id) return;
        // O próprio usuário só altera dados de identificação — nunca o perfil
        // de acesso, o status ou a senha (a senha tem fluxo próprio).
        const seguro: Partial<Usuario> = {};
        if (patch.nome !== undefined) seguro.nome = patch.nome;
        if (patch.email !== undefined) seguro.email = patch.email;
        if (patch.cargo !== undefined) seguro.cargo = patch.cargo;
        if (patch.setor !== undefined) seguro.setor = patch.setor;
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === id ? { ...u, ...seguro } : u
          ),
        }));
      },

      alterarSenha: (atual, nova) => {
        const id = get().usuarioAtualId;
        const usuario = get().usuarios.find((u) => u.id === id);
        if (!usuario) return "Sessão expirada.";
        if (usuario.senha !== atual) return "A senha atual está incorreta.";
        if (nova.length < 6)
          return "A nova senha deve ter ao menos 6 caracteres.";
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === id ? { ...u, senha: nova } : u
          ),
        }));
        return null;
      },

      criarUsuario: (dados) =>
        set((s) => ({
          usuarios: [
            ...s.usuarios,
            {
              ...dados,
              id: novoId("u"),
              criadoEm: format(new Date(), "yyyy-MM-dd"),
            },
          ],
        })),

      atualizarUsuario: (id, patch) =>
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === id ? { ...u, ...patch } : u
          ),
        })),

      alternarUsuarioAtivo: (id) =>
        set((s) => ({
          usuarios: s.usuarios.map((u) =>
            u.id === id ? { ...u, ativo: !u.ativo } : u
          ),
        })),

      removerUsuario: (id) => {
        if (id === get().usuarioAtualId)
          return "Você não pode remover o próprio usuário conectado.";
        set((s) => ({ usuarios: s.usuarios.filter((u) => u.id !== id) }));
        return null;
      },

      criarPerfil: (dados) =>
        set((s) => ({
          perfis: [...s.perfis, { ...dados, id: novoId("perfil") }],
        })),

      atualizarPerfil: (id, patch) =>
        set((s) => ({
          perfis: s.perfis.map((p) => {
            if (p.id !== id) return p;
            // Perfil do sistema mantém acesso total: só rótulos são editáveis.
            if (p.sistema) {
              return {
                ...p,
                nome: patch.nome ?? p.nome,
                descricao: patch.descricao ?? p.descricao,
                cor: patch.cor ?? p.cor,
              };
            }
            return { ...p, ...patch };
          }),
        })),

      togglePermissao: (perfilId, permissao) =>
        set((s) => ({
          perfis: s.perfis.map((p) => {
            if (p.id !== perfilId || p.sistema) return p;
            const possui = p.permissoes.includes(permissao);
            return {
              ...p,
              permissoes: possui
                ? p.permissoes.filter((k) => k !== permissao)
                : [...p.permissoes, permissao],
            };
          }),
        })),

      removerPerfil: (id) => {
        const perfil = get().perfis.find((p) => p.id === id);
        if (!perfil) return "Perfil não encontrado.";
        if (perfil.sistema)
          return "Este perfil do sistema não pode ser excluído.";
        const emUso = get().usuarios.some((u) => u.perfilId === id);
        if (emUso)
          return "Há usuários vinculados a este perfil. Reatribua-os antes de excluir.";
        set((s) => ({ perfis: s.perfis.filter((p) => p.id !== id) }));
        return null;
      },

      atualizarInfoInstitucional: (patch) =>
        set((s) => ({
          infoInstitucional: { ...s.infoInstitucional, ...patch },
        })),

      restaurarPadroes: () =>
        set({
          usuarios: USUARIOS_PADRAO,
          perfis: PERFIS_PADRAO,
          infoInstitucional: INFO_INSTITUCIONAL_PADRAO,
          usuarioAtualId: null,
          erroLogin: null,
        }),
    }),
    {
      name: "sigc-acesso",
      version: 1,
      storage: safeStorage,
      partialize: (s) => ({
        usuarioAtualId: s.usuarioAtualId,
        usuarios: s.usuarios,
        perfis: s.perfis,
        infoInstitucional: s.infoInstitucional,
      }),
    }
  )
);
