import { Wallet, FileEdit, Gavel, MessageCircleWarning, PauseCircle, FolderPlus, type LucideIcon } from "lucide-react";
import type { PenaltyCategory } from "@/types";

export const PENALTY_ICON: Record<PenaltyCategory, LucideIcon> = {
  "aguardando-pagamento": Wallet,
  "fazer-nt": FileEdit,
  "em-defesa": Gavel,
  "aguardando-justificativa": MessageCircleWarning,
  "em-espera": PauseCircle,
  "recem-aberto": FolderPlus,
};
