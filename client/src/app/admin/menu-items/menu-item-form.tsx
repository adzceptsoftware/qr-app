"use client";

import { ImageInput } from "@/components/ui/ImageInput";
import { Card, inputClass, labelClass, btnPrimary, btnSecondary } from "@/components/dashboard/ui";
import { Select } from "@/components/dashboard/select";
import { createMenuItem, updateMenuItem } from "./actions";

type Category = { id: string; name: string; parentId?: string | null };
type MenuItem = {
  id: string; name: string; price: number; available: boolean; categoryId: string; categoryName: string;
  description?: string; imageUrl?: string; badge?: string;
};

/** Flatten categories into select options with subcategories indented under their parent. */
function buildCategoryOptions(categories: Category[]) {
  const subsByParent = new Map<string, Category[]>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const list = subsByParent.get(c.parentId) ?? [];
    list.push(c);
    subsByParent.set(c.parentId, list);
  }
  return categories
    .filter((c) => !c.parentId)
    .flatMap((c) => [
      { value: c.id, label: c.name },
      ...(subsByParent.get(c.id) ?? []).map((s) => ({ value: s.id, label: `— ${s.name}` })),
    ]);
}

export function MenuItemForm({
  categories,
  editingItem,
  onDone,
  onCancel,
}: {
  categories: Category[];
  editingItem: MenuItem | null;
  /** Called after a successful create/update. */
  onDone: () => void;
  onCancel: () => void;
}) {
  const isEditing = !!editingItem;

  return (
    // key forces the form to remount (and reset its default values) when the
    // edit target changes, so the same form always reflects the selected item.
    <Card key={editingItem?.id ?? "new"} className={`p-5 ${isEditing ? "ring-2 ring-accent/30" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{isEditing ? "Edit item" : "Add menu item"}</h2>
        {isEditing && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
            Editing
          </span>
        )}
      </div>

      <form
        action={async (formData) => {
          if (editingItem) await updateMenuItem(editingItem.id, formData);
          else await createMenuItem(formData);
          onDone();
        }}
        className="space-y-4"
      >
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <label className={labelClass}>Name</label>
            <input name="name" defaultValue={editingItem?.name ?? ""} placeholder="e.g. Grilled Salmon" required className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Price</label>
            <input name="price" type="number" step="0.01" min="0" defaultValue={editingItem?.price ?? ""} placeholder="0.00" required className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Description</label>
          <input name="description" defaultValue={editingItem?.description ?? ""} placeholder="Optional" className={inputClass} />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <Select
            name="categoryId"
            defaultValue={editingItem?.categoryId}
            options={buildCategoryOptions(categories)}
          />
        </div>

        <div>
          <label className={labelClass}>Photo</label>
          <ImageInput name="imageUrl" defaultValue={editingItem?.imageUrl ?? ""} />
        </div>

        <label className="flex items-center gap-3 rounded-xl bg-accent/10 px-4 py-3 text-base font-medium text-foreground">
          <input type="checkbox" name="todaySpecial" defaultChecked={!!editingItem?.badge} className="h-5 w-5 rounded border-border text-accent focus:ring-accent" />
          Feature in Today&apos;s Special
        </label>

        <div className="flex gap-2">
          <button className={`${btnPrimary} flex-1`}>{isEditing ? "Save changes" : "Add item"}</button>
          {isEditing && (
            <button type="button" onClick={onCancel} className={btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
