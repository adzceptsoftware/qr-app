"use client";

import { useMemo } from "react";
import { PaginatedList } from "@/components/dashboard/paginated-list";
import { CategoryRow } from "./category-row";

type Category = { id: string; name: string; imageUrl?: string | null; parentId?: string | null; itemCount: number };

export function CategoriesList({
  categories,
  onEdit,
  editingId,
}: {
  categories: Category[];
  onEdit: (category: Category) => void;
  editingId: string | null;
}) {
  const { topLevel, subsByParent } = useMemo(() => {
    const top = categories.filter((c) => !c.parentId);
    const subs = new Map<string, Category[]>();
    for (const c of categories) {
      if (!c.parentId) continue;
      const list = subs.get(c.parentId) ?? [];
      list.push(c);
      subs.set(c.parentId, list);
    }
    return { topLevel: top, subsByParent: subs };
  }, [categories]);

  return (
    <PaginatedList
      items={topLevel}
      getKey={(c) => c.id}
      getSearchText={(c) => `${c.name} ${(subsByParent.get(c.id) ?? []).map((s) => s.name).join(" ")}`}
      searchPlaceholder="Search categories…"
      pageSize={12}
      emptyTitle="No categories yet"
      emptyHint="Create your first category to start building the menu."
      renderItem={(c) => (
        <>
          <CategoryRow category={c} onEdit={onEdit} active={c.id === editingId} />
          {(subsByParent.get(c.id) ?? []).map((sub) => (
            <CategoryRow key={sub.id} category={sub} onEdit={onEdit} active={sub.id === editingId} indented />
          ))}
        </>
      )}
    />
  );
}
