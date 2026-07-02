"use client";

import { useState } from "react";
import { ImageInput } from "@/components/ui/ImageInput";
import { createMenuItem } from "./actions";

type Category = { id: string; name: string };

export function CreateMenuItemForm({ categories }: { categories: Category[] }) {
  const [formKey, setFormKey] = useState(0);

  return (
    <form
      key={formKey}
      action={async (formData) => {
        await createMenuItem(formData);
        setFormKey((k) => k + 1);
      }}
      className="mb-6 space-y-2 rounded-xl border border-stone-200 bg-white p-4"
    >
      <div className="flex gap-2">
        <input name="name" placeholder="Item name" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input name="price" type="number" step="0.01" min="0" placeholder="Price" required
          className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
      </div>
      <input name="description" placeholder="Description (optional)"
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
      <select name="categoryId" required className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm">
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <ImageInput name="imageUrl" />

      <label className="flex items-center gap-2 text-sm text-stone-700">
        <input type="checkbox" name="todaySpecial" className="h-4 w-4 rounded border-stone-300" />
        Add to Today&apos;s Special
      </label>

      <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
        Add item
      </button>
    </form>
  );
}
