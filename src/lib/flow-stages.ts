import {
  ClipboardList,
  Send,
  Stamp,
  ClipboardCheck,
  Wrench,
  Scale,
  PenTool,
  Megaphone,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import type { FlowStageId } from "@/types";

export interface FlowStageMeta {
  id: FlowStageId;
  ordem: number;
  nome: string;
  nomeCurto: string;
  descricao: string;
  icon: LucideIcon;
}

export const FLOW_STAGES: FlowStageMeta[] = [
  {
    id: "planejamento",
    ordem: 1,
    nome: "Planejamento",
    nomeCurto: "Planejamento",
    descricao: "Antecipação da necessidade de prorrogação contratual",
    icon: ClipboardList,
  },
  {
    id: "solicitacao",
    ordem: 2,
    nome: "Solicitação da Prorrogação",
    nomeCurto: "Solicitação",
    descricao: "Abertura formal do pedido de prorrogação",
    icon: Send,
  },
  {
    id: "aguardando-cdo",
    ordem: 3,
    nome: "Aguardando CDO",
    nomeCurto: "Aguard. CDO",
    descricao: "Aguardando manifestação da Coordenação de Orçamento",
    icon: Stamp,
  },
  {
    id: "fiscalizacao",
    ordem: 4,
    nome: "Fiscalização",
    nomeCurto: "Fiscalização",
    descricao: "Análise e manifestação do fiscal do contrato",
    icon: ClipboardCheck,
  },
  {
    id: "area-tecnica",
    ordem: 5,
    nome: "Área Técnica",
    nomeCurto: "Área Técnica",
    descricao: "Parecer técnico especializado sobre a prorrogação",
    icon: Wrench,
  },
  {
    id: "juridico",
    ordem: 6,
    nome: "Jurídico",
    nomeCurto: "Jurídico",
    descricao: "Análise jurídica e parecer da procuradoria",
    icon: Scale,
  },
  {
    id: "assinaturas",
    ordem: 7,
    nome: "Assinaturas",
    nomeCurto: "Assinaturas",
    descricao: "Coleta de assinaturas do Termo Aditivo",
    icon: PenTool,
  },
  {
    id: "publicacao",
    ordem: 8,
    nome: "Publicação",
    nomeCurto: "Publicação",
    descricao: "Publicação oficial do extrato do Termo Aditivo",
    icon: Megaphone,
  },
  {
    id: "nova-vigencia",
    ordem: 9,
    nome: "Nova Vigência",
    nomeCurto: "Concluído",
    descricao: "Contrato com prorrogação concluída e vigente",
    icon: BadgeCheck,
  },
];

export const FLOW_STAGE_MAP: Record<FlowStageId, FlowStageMeta> = FLOW_STAGES.reduce(
  (acc, stage) => {
    acc[stage.id] = stage;
    return acc;
  },
  {} as Record<FlowStageId, FlowStageMeta>
);

export function stageIndex(id: FlowStageId): number {
  return FLOW_STAGES.findIndex((s) => s.id === id);
}
