import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { CreateMenuItemForm } from "./create-menu-item-form";
import { MenuItemRow } from "./menu-item-row";

type Category = { id: string; name: string };
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
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Menu Items</h1>

      {categories.length === 0 ? (
        <p className="text-stone-400">Create a category first.</p>
      ) : (
        <CreateMenuItemForm categories={categories} />
      )}

      <ul className="space-y-2">
        {menuItems.map((item) => (
          <MenuItemRow key={item.id} item={item} categories={categories} />
        ))}
        {menuItems.length === 0 && <p className="text-stone-400">No menu items yet.</p>}
      </ul>
    </div>
  );
}
