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
    nome: "Editor",
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

/** Informações institucionais corretas: SRA/MS — Campo Grande/MS. */
export const INFO_INSTITUCIONAL_PADRAO: InfoInstitucional = {
  sistema: "SIGC — Sistema Inteligente de Gestão de Contratos",
  secretaria: "Secretaria de Serviços Compartilhados",
  unidade: "Superintendência Regional de Administração no Estado do Mato Grosso do Sul",
  setor: "Seção de Licitações e Contratos",
  estado: "Mato Grosso do Sul",
  cidade: "Campo Grande",
};

/**
 * Logins de acesso padrão. A senha é armazenada apenas localmente (localStorage)
 * para simular o controle de acesso neste ambiente de teste — não há back-end.
 */
export const USUARIOS_PADRAO: Usuario[] = [
  {
    id: "u-thayssa",
    nome: "Thayssa Kerollyn",
    email: "thayssakerollyn@gmail.com",
    cargo: "Coordenadora de Contratos",
    setor: "Seção de Licitações e Contratos",
    perfilId: "administrador",
    senha: "admin123",
    ativo: true,
    criadoEm: "2026-01-05",
  },
  {
    id: "u-carlos",
    nome: "Carlos Andrade",
    email: "carlos.andrade@sra.ms.gov.br",
    cargo: "Gestor de Contratos",
    setor: "Seção de Licitações e Contratos",
    perfilId: "gestor",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-02-10",
  },
  {
    id: "u-mariana",
    nome: "Mariana Lopes",
    email: "mariana.lopes@sra.ms.gov.br",
    cargo: "Analista Administrativo",
    setor: "Seção de Licitações e Contratos",
    perfilId: "editor",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-02-18",
  },
  {
    id: "u-rafael",
    nome: "Rafael Souza",
    email: "rafael.souza@sra.ms.gov.br",
    cargo: "Fiscal de Contratos",
    setor: "Fiscalização de Contratos",
    perfilId: "fiscal",
    senha: "sigc123",
    ativo: true,
    criadoEm: "2026-03-02",
  },
  {
    id: "u-beatriz",
    nome: "Beatriz Nunes",
    email: "beatriz.nunes@sra.ms.gov.br",
    cargo: "Assistente Administrativo",
    setor: "Seção de Licitações e Contratos",
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
