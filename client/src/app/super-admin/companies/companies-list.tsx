"use client";

import Link from "next/link";
import { PaginatedList } from "@/components/dashboard/paginated-list";
import { iconDelete, TrashIcon } from "@/components/dashboard/ui";
import { toggleCompany, deleteCompany } from "./actions";

type Company = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  adminCount: number;
  orderCount: number;
};

export function CompaniesList({ companies }: { companies: Company[] }) {
  return (
    <PaginatedList
      items={companies}
      as="div"
      getKey={(c) => c.id}
      getSearchText={(c) => `${c.name} ${c.address ?? ""} ${c.phone ?? ""}`}
      searchPlaceholder="Search hotels…"
      pageSize={10}
      emptyTitle="No hotels yet"
      emptyHint="Create the first one using the form above."
      renderItem={(c) => (
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface px-4 py-4 shadow-sm sm:flex-row sm:items-center">
          <div className="flex flex-1 items-start gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600">
              {c.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-base font-semibold text-foreground">{c.name}</p>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    c.active ? "bg-emerald-50 text-emerald-700" : "bg-danger/10 text-danger"
                  }`}
                >
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
              {c.address && <p className="mt-0.5 text-sm text-muted">{c.address}</p>}
              {c.phone && <p className="text-sm text-muted">{c.phone}</p>}
              <p className="mt-1 text-sm text-muted">
                {c.adminCount} admin{c.adminCount !== 1 ? "s" : ""} · {c.orderCount} orders
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:pl-3">
            <Link
              href={`/super-admin/companies/${c.id}/tables`}
              className="inline-flex min-h-[44px] items-center rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
            >
              Tables & QR
            </Link>
            <form action={toggleCompany.bind(null, c.id)}>
              <button
                className={`inline-flex min-h-[44px] items-center rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                  c.active
                    ? "border-amber-300 text-amber-700 hover:bg-amber-50"
                    : "border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {c.active ? "Deactivate" : "Activate"}
              </button>
            </form>
            <form action={deleteCompany.bind(null, c.id)}>
              <button className={iconDelete} aria-label="Delete hotel" title="Delete">
                <TrashIcon />
              </button>
            </form>
          </div>
        </div>
      )}
    />
  );
}
