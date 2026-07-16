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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badge?: string;
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
  { label: "Configurações", href: "/configuracoes", icon: Settings },
];
