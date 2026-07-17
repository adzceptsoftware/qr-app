"use client";

import { useRef, useState } from "react";
import { MenuItemForm } from "./menu-item-form";
import { MenuItemsList } from "./menu-items-list";

type Category = { id: string; name: string; parentId?: string | null };
type MenuItem = {
  id: string; name: string; price: number; available: boolean; categoryId: string; categoryName: string;
  description?: string; imageUrl?: string; badge?: string;
};

export function MenuItemsManager({ categories, items }: { categories: Category[]; items: MenuItem[] }) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleEdit(item: MenuItem) {
    setEditing(item);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
      <div ref={formRef} className="lg:sticky lg:top-6">
        <MenuItemForm
          categories={categories}
          editingItem={editing}
          onDone={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-foreground">All items</h2>
          <span className="text-sm text-muted">{items.length} total</span>
        </div>
        <MenuItemsList items={items} onEdit={handleEdit} editingId={editing?.id ?? null} />
      </div>
    </div>
  );
}
