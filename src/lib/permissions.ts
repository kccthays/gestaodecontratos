import type {
  InfoInstitucional,
  PerfilAcesso,
  PermissionKey,
  Usuario,
} from "@/types";

export interface PermissionMeta {
  key: PermissionKey;
  label: string;
  descricao: string;
  grupo: string;
}

/**
 * Catálogo de todas as permissões disponíveis no sistema, organizadas por grupo.
 * Cada perfil de acesso é composto por um subconjunto destas permissões.
 */
export const PERMISSOES: PermissionMeta[] = [
  {
    key: "gerenciar_usuarios",
    label: "Gerenciar usuários",
    descricao: "Criar, editar, ativar/desativar e remover logins de acesso.",
    grupo: "Administração do sistema",
  },
  {
    key: "gerenciar_permissoes",
    label: "Gerenciar perfis e permissões",
    descricao: "Criar e alterar perfis de acesso e suas permissões.",
    grupo: "Administração do sistema",
  },
  {
    key: "editar_info_institucional",
    label: "Editar informações institucionais",
    descricao: "Alterar unidade, setor, cidade, estado e demais dados do órgão.",
    grupo: "Administração do sistema",
  },
  {
    key: "editar_contratos",
    label: "Editar contratos",
    descricao: "Criar, alterar e atualizar os dados dos contratos.",
    grupo: "Gestão de contratos",
  },
  {
    key: "editar_prorrogacoes",
    label: "Gerenciar prorrogações",
    descricao: "Registrar e alterar termos aditivos e prorrogações.",
    grupo: "Gestão de contratos",
  },
  {
    key: "editar_penalidades",
    label: "Gerenciar penalidades",
    descricao: "Instaurar e movimentar processos sancionadores.",
    grupo: "Gestão de contratos",
  },
  {
    key: "editar_fluxo",
    label: "Atualizar fluxo e etapas",
    descricao: "Movimentar contratos entre as etapas do mapa de fluxo.",
    grupo: "Gestão de contratos",
  },
  {
    key: "editar_processos_sei",
    label: "Gerenciar processos SEI",
    descricao: "Vincular e atualizar processos SEI aos contratos.",
    grupo: "Gestão de contratos",
  },
  {
    key: "importar_dados",
    label: "Importar e exportar dados",
    descricao: "Importar planilhas e restaurar os dados do sistema.",
    grupo: "Dados e relatórios",
  },
  {
    key: "editar_relatorios",
    label: "Gerar e editar relatórios",
    descricao: "Produzir, personalizar e exportar relatórios gerenciais.",
    grupo: "Dados e relatórios",
  },
];

export const TODAS_PERMISSOES: PermissionKey[] = PERMISSOES.map((p) => p.key);

export const GRUPOS_PERMISSAO: string[] = Array.from(
  new Set(PERMISSOES.map((p) => p.grupo))
);

/** Perfis de acesso padrão. Todos, exceto o Administrador, são editáveis. */
export const PERFIS_PADRAO: PerfilAcesso[] = [
  {
    id: "administrador",
    nome: "Administrador Geral",
    descricao:
      "Acesso total. Pode alterar todas as informações do site, gerenciar usuários e definir permissões.",
    cor: "danger",
    sistema: true,
    permissoes: [...TODAS_PERMISSOES],
  },
  {
    id: "gestor",
    nome: "Gestor de Contratos",
    descricao:
      "Altera todas as informações operacionais do site: contratos, prorrogações, penalidades, fluxo, dados e informações institucionais.",
    cor: "info",
    permissoes: [
      "editar_info_institucional",
      "editar_contratos",
      "editar_prorrogacoes",
      "editar_penalidades",
      "editar_fluxo",
      "editar_processos_sei",
      "importar_dados",
      "editar_relatorios",
    ],
  },
  {
    id: "editor",
    nome: "Apoio",
    descricao:
      "Edita contratos, prorrogações, fluxo, processos SEI e relatórios do dia a dia.",
    cor: "success",
    permissoes: [
      "editar_contratos",
      "editar_prorrogacoes",
      "editar_fluxo",
      "editar_processos_sei",
      "importar_dados",
      "editar_relatorios",
    ],
  },
  {
    id: "fiscal",
    nome: "Fiscal",
    descricao:
      "Atualiza o andamento das etapas dos contratos que fiscaliza e emite relatórios.",
    cor: "warning",
    permissoes: ["editar_fluxo", "editar_relatorios"],
  },
  {
    id: "leitor",
    nome: "Visualizador",
    descricao:
      "Somente leitura. Consulta contratos, indicadores e relatórios sem alterar informações.",
    cor: "secondary",
    permissoes: [],
  },
];

/**
 * Informações institucionais padrão — genéricas, apenas para exemplo.
 * Cada órgão preenche os dados reais na tela de Configurações (ficam salvos
 * localmente, não no código-fonte público).
 */
export const INFO_INSTITUCIONAL_PADRAO: InfoInstitucional = {
  sistema: "SIGC — Sistema Inteligente de Gestão de Contratos",
  secretaria: "Órgão Público",
  unidade: "Unidade Administrativa",
  setor: "Setor de Licitações e Contratos",
  estado: "UF",
  cidade: "Cidade",
};

/**
 * Logins de acesso padrão. A senha é armazenada apenas localmente (localStorage)
 * para simular o controle de acesso neste ambiente de teste — não há back-end.
 */
export const USUARIOS_PADRAO: Usuario[] = [
  {
    id: "u-admin",
    nome: "Administrador",
    email: "admin@example.com",
    cargo: "Administrador do Sistema",
    setor: "Setor de Contratos",
    perfilId: "administrador",
    senha: "admin123",
    ativo: true,
    criadoEm: "2026-01-05",
  },
  {
    id: "u-gestor",
    nome: "Usuário Gestor",
    email: "gestor@example.com",
    cargo: "Gestor de Contratos",
    setor: "Setor de Contratos",
    perfilId: "gestor",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-02-10",
  },
  {
    id: "u-apoio",
    nome: "Usuário Apoio",
    email: "apoio@example.com",
    cargo: "Analista Administrativo",
    setor: "Setor de Contratos",
    perfilId: "editor",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-02-18",
  },
  {
    id: "u-fiscal",
    nome: "Usuário Fiscal",
    email: "fiscal@example.com",
    cargo: "Fiscal de Contratos",
    setor: "Fiscalização de Contratos",
    perfilId: "fiscal",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-03-02",
  },
  {
    id: "u-consulta",
    nome: "Usuário Consulta",
    email: "consulta@example.com",
    cargo: "Assistente Administrativo",
    setor: "Setor de Contratos",
    perfilId: "leitor",
    senha: "sigc123",
    ativo: false,
    criadoEm: "2026-03-20",
  },
];

/** Verifica se um perfil concede determinada permissão. */
export function perfilTemPermissao(
  perfil: PerfilAcesso | undefined | null,
  permissao: PermissionKey
): boolean {
  if (!perfil) return false;
  if (perfil.sistema) return true;
  return perfil.permissoes.includes(permissao);
}
