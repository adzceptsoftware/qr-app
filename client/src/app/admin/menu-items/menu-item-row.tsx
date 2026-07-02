"use client";

import { useState } from "react";
import { ImageInput } from "@/components/ui/ImageInput";
import { deleteMenuItem, toggleAvailability, updateMenuItem } from "./actions";

type Category = { id: string; name: string };
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

export function MenuItemRow({ item, categories }: { item: MenuItem; categories: Category[] }) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <li className="rounded-xl border border-stone-300 bg-white p-4">
        <form
          action={async (formData) => {
            await updateMenuItem(item.id, formData);
            setEditing(false);
          }}
          className="space-y-2"
        >
          <div className="flex gap-2">
            <input
              name="name"
              defaultValue={item.name}
              placeholder="Item name"
              required
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue={item.price}
              placeholder="Price"
              required
              className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm"
            />
          </div>
          <input
            name="description"
            defaultValue={item.description ?? ""}
            placeholder="Description (optional)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          />
          <select
            name="categoryId"
            defaultValue={item.categoryId}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <ImageInput name="imageUrl" defaultValue={item.imageUrl ?? ""} />

          <label className="flex items-center gap-2 text-sm text-stone-700">
            <input type="checkbox" name="todaySpecial" defaultChecked={!!item.badge} className="h-4 w-4 rounded border-stone-300" />
            Add to Today&apos;s Special
          </label>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        {item.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.imageUrl} alt={item.name} className="h-12 w-12 shrink-0 rounded-lg border border-stone-200 object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-stone-200 text-stone-300">
            🍽️
          </div>
        )}
        <div>
          <p className="font-medium text-stone-900">
            {item.name}{" "}
            <span className="text-sm text-stone-400">({item.categoryName})</span>
          </p>
          <p className="text-sm text-stone-500">${item.price.toFixed(2)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setEditing(true)} className="text-sm font-medium text-stone-600 hover:text-stone-900">
          Edit
        </button>
        <form action={toggleAvailability.bind(null, item.id, !item.available)}>
          <button className={`text-sm font-medium ${item.available ? "text-emerald-700" : "text-stone-400"}`}>
            {item.available ? "Available" : "Unavailable"}
          </button>
        </form>
        <form action={deleteMenuItem.bind(null, item.id)}>
          <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
        </form>
      </div>
    </li>
  );
}
