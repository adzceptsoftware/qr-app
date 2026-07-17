"use client";

import { iconEdit, iconDelete, PencilIcon, TrashIcon } from "@/components/dashboard/ui";
import { deleteCategory } from "./actions";

type Category = { id: string; name: string; imageUrl?: string | null; parentId?: string | null; itemCount: number };

export function CategoryRow({
  category,
  onEdit,
  active,
  indented = false,
}: {
  category: Category;
  onEdit: (category: Category) => void;
  active: boolean;
  indented?: boolean;
}) {
  return (
    <li
      className={`flex items-center justify-between rounded-2xl border bg-surface px-4 shadow-sm transition-colors ${
        indented ? "ml-6 py-2.5" : "py-3.5"
      } ${active ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted/40"}`}
    >
      <div className="flex items-center gap-2.5">
        {indented && <span className="text-muted" aria-hidden>↳</span>}
        {indented && (
          category.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={category.imageUrl} alt={category.name} className="h-9 w-9 shrink-0 rounded-lg border border-border object-cover" />
          ) : (
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted">
              🍽️
            </div>
          )
        )}
        <div>
          <p className={`font-semibold text-foreground ${indented ? "text-sm" : "text-base"}`}>{category.name}</p>
          <p className="text-sm text-muted">
            {category.itemCount} item{category.itemCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onEdit(category)} className={iconEdit} aria-label="Edit category" title="Edit">
          <PencilIcon />
        </button>
        <form action={deleteCategory.bind(null, category.id)}>
          <button className={iconDelete} aria-label="Delete category" title="Delete">
            <TrashIcon />
          </button>
        </form>
      </div>
    </li>
  );
}
