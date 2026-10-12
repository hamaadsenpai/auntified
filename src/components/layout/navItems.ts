import type { ComponentType } from "react";
import { HistoryIcon, HomeIcon, SendMoneyIcon, SettingsIcon } from "@/components/icons";
import { ROUTES } from "@/constants";

export type NavKey = "home" | "pay" | "ledger" | "settings";

export const NAV_ITEMS: { key: NavKey; label: string; href: string; Icon: ComponentType<{ size?: number; className?: string }> }[] = [
  { key: "home", label: "Home", href: ROUTES.HOME, Icon: HomeIcon },
  { key: "pay", label: "Send money", href: ROUTES.PAY, Icon: SendMoneyIcon },
  { key: "ledger", label: "History", href: ROUTES.LEDGER, Icon: HistoryIcon },
  { key: "settings", label: "Settings", href: ROUTES.SETTINGS, Icon: SettingsIcon },
];
