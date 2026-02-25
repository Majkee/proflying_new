import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  CalendarDays,
  Users,
  Layers,
  CreditCard,
  Settings,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  roles?: ("super_admin" | "manager" | "instructor")[];
  mobileHidden?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Pulpit",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Kalendarz",
    href: "/calendar",
    icon: CalendarDays,
    mobileHidden: true,
  },
  {
    label: "Obecnosc",
    href: "/attendance",
    icon: ClipboardCheck,
  },
  {
    label: "Grafik",
    href: "/schedule",
    icon: Calendar,
  },
  {
    label: "Kursantki",
    href: "/students",
    icon: Users,
  },
  {
    label: "Grupy",
    href: "/groups",
    icon: Layers,
    mobileHidden: true,
  },
  {
    label: "Platnosci",
    href: "/payments",
    icon: CreditCard,
    roles: ["super_admin", "manager"],
  },
  {
    label: "Ustawienia",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin"],
    mobileHidden: true,
  },
];

export const MOBILE_MORE_ITEMS: NavItem[] = [
  {
    label: "Kalendarz",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    label: "Grupy",
    href: "/groups",
    icon: Layers,
  },
  {
    label: "Platnosci",
    href: "/payments",
    icon: CreditCard,
    roles: ["super_admin", "manager"],
  },
  {
    label: "Ustawienia",
    href: "/settings",
    icon: Settings,
    roles: ["super_admin"],
  },
];
