"use client";

import { useRef, useState } from "react";
import { CategoryForm } from "./category-form";
import { CategoriesList } from "./categories-list";

type Category = { id: string; name: string; imageUrl?: string | null; parentId?: string | null; itemCount: number };

export function CategoriesManager({ categories }: { categories: Category[] }) {
  const [editing, setEditing] = useState<Category | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const topLevel = categories.filter((c) => !c.parentId);

  function handleEdit(category: Category) {
    setEditing(category);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr] lg:items-start">
      <div ref={formRef}>
        <CategoryForm
          editingCategory={editing}
          parents={topLevel}
          onDone={() => setEditing(null)}
          onCancel={() => setEditing(null)}
        />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-foreground">All categories</h2>
          <span className="text-sm text-muted">{categories.length} total</span>
        </div>
        <CategoriesList categories={categories} onEdit={handleEdit} editingId={editing?.id ?? null} />
      </div>
    </div>
  );
}
