import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { createCategory, deleteCategory } from "./actions";

type Category = { id: string; name: string; icon?: string; itemCount: number };

export default async function CategoriesPage() {
  const session = await auth();
  const categories = await api<Category[]>("/categories", { token: session!.user.accessToken });

  return (
    <div className="max-w-xl">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Categories</h1>
      <form action={createCategory} className="mb-6 flex gap-2">
        <input name="name" placeholder="e.g. Desserts" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Add
        </button>
      </form>
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="flex items-center justify-between rounded-lg border border-stone-200 bg-white px-4 py-3">
            <span className="text-stone-900">
              {c.icon && <span className="mr-2">{c.icon}</span>}
              {c.name}{" "}
              <span className="text-sm text-stone-400">({c.itemCount} items)</span>
            </span>
            <form action={deleteCategory.bind(null, c.id)}>
              <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
            </form>
          </li>
        ))}
        {categories.length === 0 && <p className="text-stone-400">No categories yet.</p>}
      </ul>
    </div>
  );
}
