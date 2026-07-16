import {
  LayoutDashboard,
  FileText,
  RefreshCw,
  ShieldAlert,
  BarChart3,
  CalendarDays,
  FileBarChart,
  FolderKanban,
  Settings,
  Workflow,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import type { PermissionKey } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
  /** Se definido, o item só aparece para quem possui ao menos uma das permissões. */
  permissoes?: PermissionKey[];
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Mapa de Fluxo", href: "/fluxo", icon: Workflow, badge: "IA" },
  { label: "Contratos", href: "/contratos", icon: FileText },
  { label: "Prorrogações", href: "/prorrogacoes", icon: RefreshCw },
  { label: "Penalidades", href: "/penalidades", icon: ShieldAlert },
  { label: "Indicadores", href: "/indicadores", icon: BarChart3 },
  { label: "Cronograma", href: "/cronograma", icon: CalendarDays },
  { label: "Relatórios", href: "/relatorios", icon: FileBarChart },
  { label: "Processos SEI", href: "/processos-sei", icon: FolderKanban },
  {
    label: "Usuários e Permissões",
    href: "/usuarios",
    icon: UsersRound,
    permissoes: ["gerenciar_usuarios", "gerenciar_permissoes"],
  },
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
