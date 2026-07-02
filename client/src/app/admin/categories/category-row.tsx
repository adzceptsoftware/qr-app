"use client";

import { useState } from "react";
import { deleteCategory, updateCategory } from "./actions";

type Category = { id: string; name: string; icon?: string; itemCount: number };

export function CategoryRow({ category }: { category: Category }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (editing) {
    return (
      <li className="rounded-lg border border-stone-300 bg-white p-3">
        {error && <p className="mb-2 text-xs text-red-600">{error}</p>}
        <form
          action={async (formData) => {
            setError(null);
            try {
              await updateCategory(category.id, formData);
              setEditing(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save");
            }
          }}
          className="flex gap-2"
        >
          <input
            name="name"
            defaultValue={category.name}
            required
            className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <button type="submit" className="rounded-lg bg-stone-900 px-3 py-2 text-sm font-medium text-white hover:bg-stone-700">
            Save
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-lg border border-stone-300 px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            Cancel
          </button>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3">
      <span className="text-stone-900">
        {category.icon && <span className="mr-2">{category.icon}</span>}
        {category.name}{" "}
        <span className="text-sm text-stone-400">({category.itemCount} items)</span>
      </span>
      <div className="flex items-center gap-3">
        <button onClick={() => setEditing(true)} className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Edit
        </button>
        <form action={deleteCategory.bind(null, category.id)}>
          <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
        </form>
      </div>
    </li>
  );
}
