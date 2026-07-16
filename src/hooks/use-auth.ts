"use client";

import { useAuthStore } from "@/store/use-auth-store";
import { perfilTemPermissao } from "@/lib/permissions";
import type { PerfilAcesso, PermissionKey, Usuario } from "@/types";

export function useUsuarioAtual(): Usuario | null {
  const id = useAuthStore((s) => s.usuarioAtualId);
  const usuarios = useAuthStore((s) => s.usuarios);
  if (!id) return null;
  return usuarios.find((u) => u.id === id) ?? null;
}

export function usePerfilDe(usuario: Usuario | null): PerfilAcesso | null {
  const perfis = useAuthStore((s) => s.perfis);
  if (!usuario) return null;
  return perfis.find((p) => p.id === usuario.perfilId) ?? null;
}

export function usePerfilAtual(): PerfilAcesso | null {
  const usuario = useUsuarioAtual();
  return usePerfilDe(usuario);
}

export function usePermissao(permissao: PermissionKey): boolean {
  const perfil = usePerfilAtual();
  return perfilTemPermissao(perfil, permissao);
}
