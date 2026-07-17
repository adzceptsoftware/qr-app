"use client";

import { useState } from "react";
import { ImageInput } from "@/components/ui/ImageInput";
import { Card, inputClass, labelClass, btnPrimary, btnSecondary } from "@/components/dashboard/ui";
import { Select } from "@/components/dashboard/select";
import { createCategory, updateCategory } from "./actions";

type Category = { id: string; name: string; imageUrl?: string | null; parentId?: string | null; itemCount: number };

export function CategoryForm({
  editingCategory,
  parents,
  onDone,
  onCancel,
}: {
  editingCategory: Category | null;
  /** Top-level categories that can be chosen as a parent. */
  parents: Category[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [parentId, setParentId] = useState(editingCategory?.parentId ?? "");
  const isEditing = !!editingCategory;
  // A top-level category is shown as a tab (no image); a subcategory is shown as a
  // card, so only subcategories get an image upload.
  const isSubcategory = !!parentId;

  // A category can't be its own parent.
  const parentOptions = [
    { value: "", label: "None (top-level, shown as a tab)" },
    ...parents.filter((p) => p.id !== editingCategory?.id).map((p) => ({ value: p.id, label: p.name })),
  ];

  return (
    <Card key={editingCategory?.id ?? "new"} className={`p-5 lg:sticky lg:top-6 ${isEditing ? "ring-2 ring-accent/30" : ""}`}>
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{isEditing ? "Edit category" : "Add category"}</h2>
        {isEditing && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
            Editing
          </span>
        )}
      </div>
      <p className="text-sm text-muted">Pick a parent to make this a subcategory (e.g. Ice cream under Dessert).</p>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      <form
        action={async (formData) => {
          setError(null);
          try {
            if (editingCategory) await updateCategory(editingCategory.id, formData);
            else await createCategory(formData);
            onDone();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save");
          }
        }}
        className="mt-4 space-y-3"
      >
        <div>
          <label className={labelClass}>Name</label>
          <input name="name" defaultValue={editingCategory?.name ?? ""} placeholder="Category name" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Parent category</label>
          <Select
            name="parentId"
            defaultValue={editingCategory?.parentId ?? ""}
            options={parentOptions}
            onChange={setParentId}
          />
        </div>
        {isSubcategory && (
          <div>
            <label className={labelClass}>Image</label>
            <p className="mb-1.5 text-xs text-muted">Shown on its card when browsing {parents.find((p) => p.id === parentId)?.name ?? "the parent category"}.</p>
            <ImageInput name="imageUrl" defaultValue={editingCategory?.imageUrl ?? ""} />
          </div>
        )}
        <div className="flex gap-2">
          <button className={`${btnPrimary} flex-1`}>{isEditing ? "Save changes" : "Add category"}</button>
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
