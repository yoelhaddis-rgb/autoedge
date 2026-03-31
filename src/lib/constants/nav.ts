import type { LucideIcon } from "lucide-react";
import { BarChart3, Bookmark, LayoutDashboard, Settings2 } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const dealerNavItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard
  },
  {
    label: "Deals",
    href: "/deals",
    icon: BarChart3
  },
  {
    label: "Saved",
    href: "/saved",
    icon: Bookmark
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings2
  }
];
