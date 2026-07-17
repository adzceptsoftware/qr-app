"use client";

import { DashboardShell, type NavLink } from "@/components/dashboard/dashboard-shell";

const LINKS: NavLink[] = [
  { href: "/super-admin", label: "Dashboard", icon: "dashboard" },
  { href: "/super-admin/companies", label: "Hotels", icon: "hotels" },
];

export function SuperAdminNav({
  onSignOut,
  children,
}: {
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  return (
    <DashboardShell brand="Platform" subtitle="Super admin" links={LINKS} accent="indigo" onSignOut={onSignOut}>
      {children}
    </DashboardShell>
  );
}
