"use client";

import { Fragment, useMemo, useState, type ReactNode } from "react";
import { EmptyState } from "./ui";

export function PaginatedList<T>({
  items,
  renderItem,
  getKey,
  getSearchText,
  listClassName = "space-y-2.5",
  as: List = "ul",
  searchPlaceholder = "Search…",
  pageSize = 12,
  emptyTitle = "Nothing here yet",
  emptyHint,
}: {
  items: T[];
  renderItem: (item: T) => ReactNode;
  getKey: (item: T) => string;
  /** Return searchable text for an item to enable the search box. */
  getSearchText?: (item: T) => string;
  listClassName?: string;
  /** Wrapper element — "ul" for <li> rows, "div" for card/grid rows. */
  as?: "ul" | "div";
  searchPlaceholder?: string;
  pageSize?: number;
  emptyTitle?: string;
  emptyHint?: string;
}) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !getSearchText) return items;
    return items.filter((it) => getSearchText(it).toLowerCase().includes(q));
  }, [items, query, getSearchText]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;
  const slice = filtered.slice(start, start + pageSize);

  return (
    <div>
      {getSearchText && (
        <div className="relative mb-4">
          <svg
            className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-border bg-surface py-3 pl-11 pr-4 text-base text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
          />
        </div>
      )}

      {slice.length === 0 ? (
        <EmptyState title={query ? "No matches" : emptyTitle} hint={query ? "Try a different search." : emptyHint} />
      ) : (
        <List className={listClassName}>{slice.map((it) => (
          <Fragment key={getKey(it)}>{renderItem(it)}</Fragment>
        ))}</List>
      )}

      {totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-sm text-muted">
            Showing <span className="font-semibold text-foreground">{start + 1}–{Math.min(start + pageSize, filtered.length)}</span> of{" "}
            <span className="font-semibold text-foreground">{filtered.length}</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={current === 1}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-base font-semibold text-foreground transition-colors hover:bg-background disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="min-w-[92px] text-center text-sm font-semibold text-muted">
              Page {current} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={current === totalPages}
              className="inline-flex min-h-[44px] items-center gap-1 rounded-xl border border-border bg-surface px-4 py-2 text-base font-semibold text-foreground transition-colors hover:bg-background disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
