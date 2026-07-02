import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { createMenuItem, deleteMenuItem, toggleAvailability } from "./actions";

type Category = { id: string; name: string };
type MenuItem = { id: string; name: string; price: number; available: boolean; categoryId: string; categoryName: string };

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
        <form action={createMenuItem} className="mb-6 space-y-2 rounded-xl border border-stone-200 bg-white p-4">
          <div className="flex gap-2">
            <input name="name" placeholder="Item name" required
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            <input name="price" type="number" step="0.01" min="0" placeholder="Price" required
              className="w-28 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          </div>
          <input name="description" placeholder="Description (optional)"
            className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm" />
          <div className="flex gap-2">
            <input name="imageUrl" placeholder="Image URL (optional)"
              className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
            <select name="categoryId" required className="rounded-lg border border-stone-300 px-3 py-2 text-sm">
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
            Add item
          </button>
        </form>
      )}

      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-medium text-stone-900">
                {item.name}{" "}
                <span className="text-sm text-stone-400">({item.categoryName})</span>
              </p>
              <p className="text-sm text-stone-500">${item.price.toFixed(2)}</p>
            </div>
            <div className="flex items-center gap-3">
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
        ))}
        {menuItems.length === 0 && <p className="text-stone-400">No menu items yet.</p>}
      </ul>
    </div>
  );
}
