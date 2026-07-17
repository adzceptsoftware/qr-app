"use client";

import { PaginatedList } from "@/components/dashboard/paginated-list";
import { MenuItemRow } from "./menu-item-row";

type MenuItem = {
  id: string; name: string; price: number; available: boolean; categoryId: string; categoryName: string;
  description?: string; imageUrl?: string; badge?: string;
};

export function MenuItemsList({
  items,
  onEdit,
  editingId,
}: {
  items: MenuItem[];
  onEdit: (item: MenuItem) => void;
  editingId: string | null;
}) {
  return (
    <PaginatedList
      items={items}
      getKey={(i) => i.id}
      getSearchText={(i) => `${i.name} ${i.categoryName} ${i.description ?? ""}`}
      searchPlaceholder="Search items by name or category…"
      pageSize={10}
      emptyTitle="No menu items yet"
      emptyHint="Add your first dish using the form."
      renderItem={(item) => <MenuItemRow item={item} onEdit={onEdit} active={item.id === editingId} />}
    />
  );
}
