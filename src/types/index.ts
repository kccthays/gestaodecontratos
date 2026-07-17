export type FaixaAntecedencia =
  | "planejamento"
  | "meta-batida"
  | "atencao"
  | "zona-critica";

export type FlowStageId =
  | "planejamento"
  | "solicitacao"
  | "aguardando-cdo"
  | "fiscalizacao"
  | "area-tecnica"
  | "juridico"
  | "assinaturas"
  | "publicacao"
  | "nova-vigencia";

export type FlowStageStatus =
  | "concluida"
  | "andamento"
  | "proxima"
  | "atrasada"
  | "nao-iniciada";

export interface FlowStageState {
  stageId: FlowStageId;
  status: FlowStageStatus;
  diasNaEtapa: number;
  responsavel: string;
  ultimaMovimentacao: string;
  percentualConcluido: number;
}

export type ContractStatus =
  | "vigente"
  | "em-prorrogacao"
  | "aguardando-assinatura"
  | "encerrado";

export interface HistoricoEvento {
  data: string;
  evento: string;
  autor: string;
}

export interface DocumentoContrato {
  nome: string;
  tipo: string;
  status: "pendente" | "entregue";
}

export interface ChecklistItem {
  item: string;
  concluido: boolean;
}

export interface Contract {
  id: string;
  numero: string;
  empresa: string;
  cnpj: string;
  objeto: string;
  fiscal: string;
  fiscalSubstituto?: string;
  valor: number;
  dataInicio: string;
  dataTermino: string;
  processoSEI: string;
  status: ContractStatus;
  ultimaMovimentacao: string;
  ultimaMovimentacaoDescricao: string;
  responsavelAtual: string;
  etapaAtualId: FlowStageId;
  fluxo: FlowStageState[];
  historico: HistoricoEvento[];
  documentos: DocumentoContrato[];
  checklist: ChecklistItem[];
  anoExercicio: number;
  temPlanoDeAcao: boolean;
  observacaoStatus?: string;
  diasAntecedenciaConclusao?: number;
  emailsEmpresa: string[];
  orgaosAtendidos: string[];
}

export type PenaltyCategory =
  | "aguardando-pagamento"
  | "fazer-nt"
  | "em-defesa"
  | "aguardando-justificativa"
  | "em-espera"
  | "recem-aberto";

export interface Penalty {
  id: string;
  contratoId: string;
  numeroProcesso: string;
  empresa: string;
  categoria: PenaltyCategory;
  status: "andamento" | "finalizado";
  dataAbertura: string;
  dataFinalizacao?: string;
  valor?: number;
  descricao: string;
}

export type CalendarEventType =
  | "prorrogacao"
  | "vencimento"
  | "penalidade"
  | "evento";

export interface CalendarEvent {
  id: string;
  data: string;
  tipo: CalendarEventType;
  titulo: string;
  contratoId?: string;
  descricao?: string;
}

export interface StreakInfo {
  dias: number;
  desde: string | null;
  disponivel: boolean;
  contratosAtivosSemPlano: number;
}

// ── Acesso, perfis e permissões ────────────────────────────────────────────

export type PermissionKey =
  | "gerenciar_usuarios"
  | "gerenciar_permissoes"
  | "editar_info_institucional"
  | "editar_contratos"
  | "editar_prorrogacoes"
  | "editar_penalidades"
  | "editar_fluxo"
  | "editar_processos_sei"
  | "importar_dados"
  | "editar_relatorios";

export interface PerfilAcesso {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  /** Perfis do sistema não podem ser excluídos e mantêm acesso total. */
  sistema?: boolean;
  permissoes: PermissionKey[];
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  setor: string;
  perfilId: string;
  senha: string;
  ativo: boolean;
  criadoEm: string;
}

export interface InfoInstitucional {
  sistema: string;
  secretaria: string;
  unidade: string;
  setor: string;
  estado: string;
  cidade: string;
}
