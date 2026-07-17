import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/dashboard/ui";
import { MenuItemsManager } from "./menu-items-manager";

type Category = { id: string; name: string; parentId?: string | null };
type MenuItem = {
  id: string; name: string; price: number; available: boolean; categoryId: string; categoryName: string;
  description?: string; imageUrl?: string; badge?: string;
};

export default async function MenuItemsPage() {
  const session = await auth();
  const token = session!.user.accessToken;

  const [categories, menuItems] = await Promise.all([
    api<Category[]>("/categories", { token }),
    api<MenuItem[]>("/menu-items", { token }),
  ]);

  return (
    <div>
      <PageHeader title="Menu Items" description="Add dishes, set prices, upload photos and manage availability." />

      {categories.length === 0 ? (
        <EmptyState title="Create a category first" hint="Menu items must belong to a category before you can add them." />
      ) : (
        <MenuItemsManager categories={categories} items={menuItems} />
      )}
    </div>
  );
}
