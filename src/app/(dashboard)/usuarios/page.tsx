"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  KeyRound,
  Lock,
  Pencil,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserCog,
  UserPlus,
  UsersRound,
} from "lucide-react";

import { SectionHeader } from "@/components/dashboard/section-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUsuarioAtual, usePerfilAtual } from "@/hooks/use-auth";
import { useAuthStore } from "@/store/use-auth-store";
import { GRUPOS_PERMISSAO, PERMISSOES, perfilTemPermissao } from "@/lib/permissions";
import { iniciais } from "@/lib/calculations";
import type { PerfilAcesso, Usuario } from "@/types";

const CORES_PERFIL = ["danger", "info", "success", "warning", "secondary"] as const;

function badgeVariantForCor(cor: string) {
  return (CORES_PERFIL as readonly string[]).includes(cor)
    ? (cor as (typeof CORES_PERFIL)[number])
    : "secondary";
}

export default function UsuariosPage() {
  const perfilAtual = usePerfilAtual();
  const podeUsuarios = perfilTemPermissao(perfilAtual, "gerenciar_usuarios");
  const podePermissoes = perfilTemPermissao(perfilAtual, "gerenciar_permissoes");

  if (!podeUsuarios && !podePermissoes) {
    return (
      <div className="space-y-5">
        <SectionHeader
          icon={UsersRound}
          title="Usuários e Permissões"
          description="Gestão de logins e níveis de acesso ao sistema."
        />
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
              <Lock className="size-6" />
            </div>
            <p className="text-base font-semibold">Acesso restrito</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Seu perfil não possui permissão para gerenciar usuários ou perfis de acesso. Solicite
              a um administrador caso precise dessa função.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        icon={UsersRound}
        title="Usuários e Permissões"
        description="Cadastre logins de acesso e defina os perfis que podem alterar as informações do site."
      />

      <Tabs defaultValue={podeUsuarios ? "usuarios" : "perfis"}>
        <TabsList className="w-full sm:w-fit">
          {podeUsuarios && (
            <TabsTrigger value="usuarios">
              <UsersRound /> Usuários
            </TabsTrigger>
          )}
          {podePermissoes && (
            <TabsTrigger value="perfis">
              <ShieldCheck /> Perfis de acesso
            </TabsTrigger>
          )}
        </TabsList>

        {podeUsuarios && (
          <TabsContent value="usuarios">
            <UsuariosTab />
          </TabsContent>
        )}
        {podePermissoes && (
          <TabsContent value="perfis">
            <PerfisTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

// ── Aba de usuários ─────────────────────────────────────────────────────────

function UsuariosTab() {
  const usuarios = useAuthStore((s) => s.usuarios);
  const perfis = useAuthStore((s) => s.perfis);
  const usuarioAtual = useUsuarioAtual();
  const alternarUsuarioAtivo = useAuthStore((s) => s.alternarUsuarioAtivo);
  const removerUsuario = useAuthStore((s) => s.removerUsuario);

  const [dialogAberto, setDialogAberto] = useState(false);
  const [editando, setEditando] = useState<Usuario | null>(null);

  function nomePerfil(perfilId: string) {
    return perfis.find((p) => p.id === perfilId);
  }

  function novoUsuario() {
    setEditando(null);
    setDialogAberto(true);
  }

  function editarUsuario(u: Usuario) {
    setEditando(u);
    setDialogAberto(true);
  }

  function excluir(u: Usuario) {
    if (!window.confirm(`Remover o usuário "${u.nome}"? Esta ação não pode ser desfeita.`)) return;
    const erro = removerUsuario(u.id);
    if (erro) toast.error(erro);
    else toast.success("Usuário removido.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {usuarios.length} login(s) cadastrado(s)
        </p>
        <Button size="sm" onClick={novoUsuario}>
          <UserPlus className="size-4" /> Novo usuário
        </Button>
      </div>

      <div className="space-y-2.5">
        {usuarios.map((u) => {
          const perfil = nomePerfil(u.perfilId);
          const ehEu = u.id === usuarioAtual?.id;
          return (
            <Card key={u.id}>
              <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                <Avatar className="size-11">
                  <AvatarFallback>{iniciais(u.nome)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold">{u.nome}</p>
                    {ehEu && <Badge variant="info" className="text-[10px]">Você</Badge>}
                    {perfil && (
                      <Badge variant={badgeVariantForCor(perfil.cor)} className="gap-1 text-[10px]">
                        <ShieldCheck className="size-3" /> {perfil.nome}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {u.cargo} · {u.setor}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:gap-4">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Switch
                      checked={u.ativo}
                      onCheckedChange={() => alternarUsuarioAtivo(u.id)}
                      disabled={ehEu}
                    />
                    {u.ativo ? "Ativo" : "Inativo"}
                  </label>
                  <Button variant="ghost" size="icon-sm" onClick={() => editarUsuario(u)} aria-label="Editar">
                    <Pencil />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => excluir(u)}
                    disabled={ehEu}
                    aria-label="Remover"
                    className="text-danger hover:text-danger"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <UsuarioDialog
        aberto={dialogAberto}
        onFechar={() => setDialogAberto(false)}
        usuario={editando}
      />
    </div>
  );
}

function UsuarioDialog({
  aberto,
  onFechar,
  usuario,
}: {
  aberto: boolean;
  onFechar: () => void;
  usuario: Usuario | null;
}) {
  const perfis = useAuthStore((s) => s.perfis);
  const criarUsuario = useAuthStore((s) => s.criarUsuario);
  const atualizarUsuario = useAuthStore((s) => s.atualizarUsuario);

  const editando = Boolean(usuario);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    cargo: "",
    setor: "Setor de Contratos",
    perfilId: perfis[0]?.id ?? "",
    senha: "",
    ativo: true,
  });

  // Sincroniza o formulário sempre que o diálogo é (re)aberto.
  const [ultimoId, setUltimoId] = useState<string | null>(null);
  const chave = `${aberto}-${usuario?.id ?? "novo"}`;
  if (aberto && chave !== ultimoId) {
    setUltimoId(chave);
    setForm({
      nome: usuario?.nome ?? "",
      email: usuario?.email ?? "",
      cargo: usuario?.cargo ?? "",
      setor: usuario?.setor ?? "Setor de Contratos",
      perfilId: usuario?.perfilId ?? perfis.find((p) => !p.sistema)?.id ?? perfis[0]?.id ?? "",
      senha: usuario?.senha ?? "",
      ativo: usuario?.ativo ?? true,
    });
  }

  function salvar() {
    if (!form.nome.trim() || !form.email.trim()) {
      toast.error("Nome e e-mail são obrigatórios.");
      return;
    }
    if (!form.perfilId) {
      toast.error("Selecione um perfil de acesso.");
      return;
    }
    if (!editando && form.senha.length < 6) {
      toast.error("Defina uma senha de ao menos 6 caracteres.");
      return;
    }
    if (editando && usuario) {
      atualizarUsuario(usuario.id, {
        nome: form.nome.trim(),
        email: form.email.trim(),
        cargo: form.cargo.trim(),
        setor: form.setor.trim(),
        perfilId: form.perfilId,
        senha: form.senha,
        ativo: form.ativo,
      });
      toast.success("Usuário atualizado.");
    } else {
      criarUsuario({
        nome: form.nome.trim(),
        email: form.email.trim(),
        cargo: form.cargo.trim(),
        setor: form.setor.trim(),
        perfilId: form.perfilId,
        senha: form.senha,
        ativo: form.ativo,
      });
      toast.success("Usuário cadastrado.");
    }
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCog className="size-4 text-primary" />
            {editando ? "Editar usuário" : "Novo usuário"}
          </DialogTitle>
          <DialogDescription>
            Defina os dados de acesso e o perfil de permissões deste login.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="u-nome">Nome completo</Label>
            <Input
              id="u-nome"
              value={form.nome}
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="u-email">E-mail</Label>
              <Input
                id="u-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-cargo">Cargo</Label>
              <Input
                id="u-cargo"
                value={form.cargo}
                onChange={(e) => setForm((f) => ({ ...f, cargo: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="u-setor">Setor</Label>
            <Input
              id="u-setor"
              value={form.setor}
              onChange={(e) => setForm((f) => ({ ...f, setor: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Perfil de acesso</Label>
              <Select
                value={form.perfilId}
                onValueChange={(v) => setForm((f) => ({ ...f, perfilId: v }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {perfis.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="u-senha">
                <KeyRound className="size-3.5" /> Senha
              </Label>
              <Input
                id="u-senha"
                type="text"
                value={form.senha}
                placeholder={editando ? "Senha atual mantida" : "Mínimo 6 caracteres"}
                onChange={(e) => setForm((f) => ({ ...f, senha: e.target.value }))}
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <Switch
              checked={form.ativo}
              onCheckedChange={(v) => setForm((f) => ({ ...f, ativo: v }))}
            />
            Login ativo (pode acessar o sistema)
          </label>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>{editando ? "Salvar" : "Cadastrar"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Aba de perfis de acesso ─────────────────────────────────────────────────

function PerfisTab() {
  const perfis = useAuthStore((s) => s.perfis);
  const usuarios = useAuthStore((s) => s.usuarios);
  const criarPerfil = useAuthStore((s) => s.criarPerfil);
  const removerPerfil = useAuthStore((s) => s.removerPerfil);

  const [dialogNovo, setDialogNovo] = useState(false);
  const [editando, setEditando] = useState<PerfilAcesso | null>(null);

  function contarUsuarios(perfilId: string) {
    return usuarios.filter((u) => u.perfilId === perfilId).length;
  }

  function excluir(p: PerfilAcesso) {
    if (!window.confirm(`Excluir o perfil "${p.nome}"?`)) return;
    const erro = removerPerfil(p.id);
    if (erro) toast.error(erro);
    else toast.success("Perfil excluído.");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {perfis.length} perfil(is) de acesso · marque as permissões que cada um pode alterar
        </p>
        <Button size="sm" onClick={() => setDialogNovo(true)}>
          <Plus className="size-4" /> Novo perfil
        </Button>
      </div>

      <div className="space-y-3">
        {perfis.map((p) => (
          <PerfilCard
            key={p.id}
            perfil={p}
            usuariosVinculados={contarUsuarios(p.id)}
            onEditar={() => setEditando(p)}
            onExcluir={() => excluir(p)}
          />
        ))}
      </div>

      <PerfilDialog
        aberto={dialogNovo || Boolean(editando)}
        perfil={editando}
        onFechar={() => {
          setDialogNovo(false);
          setEditando(null);
        }}
        onCriar={(dados) => {
          criarPerfil(dados);
          toast.success("Perfil criado. Ajuste as permissões abaixo.");
        }}
      />
    </div>
  );
}

function PerfilCard({
  perfil,
  usuariosVinculados,
  onEditar,
  onExcluir,
}: {
  perfil: PerfilAcesso;
  usuariosVinculados: number;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const togglePermissao = useAuthStore((s) => s.togglePermissao);
  const bloqueado = Boolean(perfil.sistema);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <CardTitle className="flex items-center gap-2 text-base">
              <Badge variant={badgeVariantForCor(perfil.cor)} className="gap-1">
                {bloqueado ? <ShieldAlert className="size-3" /> : <ShieldCheck className="size-3" />}
                {perfil.nome}
              </Badge>
              <span className="text-xs font-normal text-muted-foreground">
                {usuariosVinculados} usuário(s)
              </span>
            </CardTitle>
            <CardDescription className="mt-1.5">{perfil.descricao}</CardDescription>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" onClick={onEditar} aria-label="Editar perfil">
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onExcluir}
              disabled={bloqueado}
              aria-label="Excluir perfil"
              className="text-danger hover:text-danger"
            >
              <Trash2 />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {bloqueado && (
          <p className="mb-3 flex items-center gap-1.5 rounded-lg bg-danger-soft/50 px-3 py-2 text-xs text-danger">
            <Lock className="size-3.5" /> Perfil do sistema — possui acesso total e não pode ser
            alterado ou excluído.
          </p>
        )}
        <div className="space-y-4">
          {GRUPOS_PERMISSAO.map((grupo) => (
            <div key={grupo}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {grupo}
              </p>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {PERMISSOES.filter((perm) => perm.grupo === grupo).map((perm) => {
                  const ativa = bloqueado || perfil.permissoes.includes(perm.key);
                  return (
                    <label
                      key={perm.key}
                      className="flex items-start gap-2.5 rounded-lg border border-border/60 px-3 py-2"
                    >
                      <Switch
                        checked={ativa}
                        disabled={bloqueado}
                        onCheckedChange={() => togglePermissao(perfil.id, perm.key)}
                        className="mt-0.5"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-tight">{perm.label}</p>
                        <p className="text-xs text-muted-foreground">{perm.descricao}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function PerfilDialog({
  aberto,
  perfil,
  onFechar,
  onCriar,
}: {
  aberto: boolean;
  perfil: PerfilAcesso | null;
  onFechar: () => void;
  onCriar: (dados: Omit<PerfilAcesso, "id">) => void;
}) {
  const atualizarPerfil = useAuthStore((s) => s.atualizarPerfil);
  const editando = Boolean(perfil);

  const [form, setForm] = useState({ nome: "", descricao: "", cor: "info" });
  const [ultimoId, setUltimoId] = useState<string | null>(null);
  const chave = `${aberto}-${perfil?.id ?? "novo"}`;
  if (aberto && chave !== ultimoId) {
    setUltimoId(chave);
    setForm({
      nome: perfil?.nome ?? "",
      descricao: perfil?.descricao ?? "",
      cor: perfil?.cor ?? "info",
    });
  }

  function salvar() {
    if (!form.nome.trim()) {
      toast.error("Informe o nome do perfil.");
      return;
    }
    if (editando && perfil) {
      atualizarPerfil(perfil.id, {
        nome: form.nome.trim(),
        descricao: form.descricao.trim(),
        cor: form.cor,
      });
      toast.success("Perfil atualizado.");
    } else {
      onCriar({
        nome: form.nome.trim(),
        descricao: form.descricao.trim() || "Perfil de acesso personalizado.",
        cor: form.cor,
        permissoes: [],
      });
    }
    onFechar();
  }

  return (
    <Dialog open={aberto} onOpenChange={(v) => !v && onFechar()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" />
            {editando ? "Editar perfil" : "Novo perfil de acesso"}
          </DialogTitle>
          <DialogDescription>
            {editando
              ? "Altere o nome, a descrição e a cor do perfil."
              : "Crie um novo tipo de permissão. Depois marque o que ele pode alterar."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-nome">Nome do perfil</Label>
            <Input
              id="p-nome"
              value={form.nome}
              placeholder="Ex.: Coordenador, Auditor, Estagiário…"
              onChange={(e) => setForm((f) => ({ ...f, nome: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Descrição</Label>
            <Textarea
              id="p-desc"
              rows={2}
              value={form.descricao}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Cor de identificação</Label>
            <div className="flex gap-2">
              {CORES_PERFIL.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, cor }))}
                  className="rounded-full outline-none"
                  aria-label={cor}
                >
                  <Badge
                    variant={cor}
                    className={
                      form.cor === cor
                        ? "ring-2 ring-ring ring-offset-2 ring-offset-background"
                        : "opacity-70"
                    }
                  >
                    {cor}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onFechar}>
            Cancelar
          </Button>
          <Button onClick={salvar}>{editando ? "Salvar" : "Criar perfil"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
