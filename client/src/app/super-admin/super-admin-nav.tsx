"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS = [
  { href: "/super-admin", label: "Dashboard" },
  { href: "/super-admin/companies", label: "Hotels" },
];

export function SuperAdminNav({ onSignOut }: { onSignOut: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav className="flex items-center gap-3 border-b border-slate-200 bg-slate-900 px-3 py-3 sm:gap-6 sm:px-6 sm:py-3.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="font-bold text-white text-sm">Platform Admin</span>
        </div>

        <div className="hidden flex-1 items-center gap-6 sm:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="whitespace-nowrap text-sm text-slate-300 hover:text-white transition-colors">
              {l.label}
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2">
          <form action={onSignOut} className="hidden sm:block">
            <button className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
              Sign out
            </button>
          </form>
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-600 text-slate-300 sm:hidden"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex w-64 flex-col gap-1 bg-slate-900 p-4 shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-bold text-white text-sm">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
              >
                {l.label}
              </Link>
            ))}
            <form action={onSignOut} className="mt-2 border-t border-slate-700 pt-3">
              <button className="w-full rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                Sign out
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
