"use client";

import { DashboardShell, type NavLink } from "@/components/dashboard/dashboard-shell";

const LINKS: NavLink[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/categories", label: "Categories", icon: "categories" },
  { href: "/admin/menu-items", label: "Menu Items", icon: "menu" },
  { href: "/admin/hero-images", label: "Menu Photos", icon: "photos" },
  { href: "/admin/kitchen-staff", label: "Kitchen Accounts", icon: "staff" },
  { href: "/kitchen", label: "Kitchen View", icon: "kitchen", external: true },
];

export function AdminNav({
  onSignOut,
  children,
}: {
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell brand="Admin" subtitle="Restaurant manager" links={LINKS} accent="amber" onSignOut={onSignOut}>
      {children}
    </DashboardShell>
  );
}
