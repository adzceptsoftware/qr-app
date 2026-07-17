"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NavIcons, type NavIconKey } from "./nav-icons";

export type NavLink = { href: string; label: string; icon: NavIconKey; external?: boolean };

type Accent = "amber" | "indigo";

const ACCENT: Record<Accent, { brand: string; active: string; bar: string; dot: string; ring: string }> = {
  amber: {
    brand: "bg-accent text-accent-foreground",
    active: "bg-accent/10 text-foreground",
    bar: "bg-accent",
    dot: "text-accent",
    ring: "focus-visible:ring-accent/40",
  },
  indigo: {
    brand: "bg-indigo-500 text-white",
    active: "bg-indigo-50 text-indigo-900",
    bar: "bg-indigo-500",
    dot: "text-indigo-600",
    ring: "focus-visible:ring-indigo-500/40",
  },
};

function isActive(pathname: string, href: string) {
  if (href === "/super-admin") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}

function NavItems({
  links,
  pathname,
  accent,
  onNavigate,
}: {
  links: NavLink[];
  pathname: string;
  accent: Accent;
  onNavigate?: () => void;
}) {
  const a = ACCENT[accent];
  return (
    <nav className="flex-1 space-y-1.5 overflow-y-auto p-3">
      {links.map((l) => {
        const active = !l.external && isActive(pathname, l.href);
        const Icon = NavIcons[l.icon];
        return (
          <Link
            key={l.href}
            href={l.href}
            target={l.external ? "_blank" : undefined}
            onClick={onNavigate}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-colors ${
              active ? a.active : "text-muted hover:bg-background hover:text-foreground"
            }`}
          >
            {active && <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-full ${a.bar}`} />}
            <Icon className={`h-6 w-6 shrink-0 ${active ? a.dot : "text-muted group-hover:text-foreground"}`} />
            <span className="truncate">{l.label}</span>
            {l.external && (
              <svg className="ml-auto h-4 w-4 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M7 17 17 7M8 7h9v9" />
              </svg>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export function DashboardShell({
  brand,
  subtitle,
  links,
  accent,
  onSignOut,
  children,
}: {
  brand: string;
  subtitle: string;
  links: NavLink[];
  accent: Accent;
  onSignOut: () => Promise<void>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const a = ACCENT[accent];

  const Brand = (
    <div className="flex items-center gap-2.5">
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${a.brand} shadow-sm`}>
        <NavIcons.kitchen className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="text-base font-bold text-foreground">{brand}</p>
        <p className="text-xs text-muted">{subtitle}</p>
      </div>
    </div>
  );

  const SignOut = (
    <form action={onSignOut}>
      <button
        className={`flex min-h-[48px] w-full items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold text-muted transition-colors hover:bg-background hover:text-foreground focus:outline-none focus-visible:ring-2 ${a.ring}`}
      >
        <NavIcons.logout className="h-6 w-6 text-muted" />
        Sign out
      </button>
    </form>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-border bg-surface lg:flex">
        <div className="flex h-16 items-center border-b border-border px-5">{Brand}</div>
        <NavItems links={links} pathname={pathname} accent={accent} />
        <div className="border-t border-border p-3">{SignOut}</div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface/90 px-4 backdrop-blur lg:hidden">
        {Brand}
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="flex h-11 w-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-background"
        >
          <NavIcons.menuIcon className="h-6 w-6" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-surface shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              {Brand}
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-10 w-10 items-center justify-center rounded-xl text-muted hover:bg-background"
              >
                <NavIcons.close className="h-5 w-5" />
              </button>
            </div>
            <NavItems links={links} pathname={pathname} accent={accent} onNavigate={() => setOpen(false)} />
            <div className="border-t border-border p-3">{SignOut}</div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="lg:pl-64">
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
