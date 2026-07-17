"use client";

import { iconEdit, iconDelete, PencilIcon, TrashIcon } from "@/components/dashboard/ui";
import { deleteMenuItem, toggleAvailability } from "./actions";

type MenuItem = {
  id: string;
  name: string;
  price: number;
  available: boolean;
  categoryId: string;
  categoryName: string;
  description?: string;
  imageUrl?: string;
  badge?: string;
};

export function MenuItemRow({
  item,
  onEdit,
  active,
}: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  active: boolean;
}) {
  return (
    <li
      className={`flex items-center gap-3 rounded-2xl border bg-surface px-3 py-3 shadow-sm transition-colors sm:px-4 ${
        active ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted/40"
      }`}
    >
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={item.imageUrl} alt={item.name} className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border border-dashed border-border text-2xl text-muted">
          🍽️
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-base font-semibold text-foreground">{item.name}</p>
          {item.badge && (
            <span className="shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-accent">
              Special
            </span>
          )}
        </div>
        <p className="text-sm text-muted">{item.categoryName}</p>
        <p className="mt-0.5 text-base font-bold text-foreground">Rs {item.price.toFixed(2)}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <form action={toggleAvailability.bind(null, item.id, !item.available)}>
          <button
            className={`inline-flex min-h-[36px] items-center rounded-full px-3.5 py-1.5 text-sm font-bold transition-colors ${
              item.available
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                : "bg-background text-muted hover:bg-border"
            }`}
          >
            {item.available ? "● Available" : "○ Hidden"}
          </button>
        </form>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(item)} className={iconEdit} aria-label="Edit item" title="Edit">
            <PencilIcon />
          </button>
          <form action={deleteMenuItem.bind(null, item.id)}>
            <button className={iconDelete} aria-label="Delete item" title="Delete">
              <TrashIcon />
            </button>
          </form>
        </div>
      </div>
    </li>
  );
}
