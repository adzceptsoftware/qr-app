import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { createCategory } from "./actions";
import { CategoryRow } from "./category-row";

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
          <CategoryRow key={c.id} category={c} />
        ))}
        {categories.length === 0 && <p className="text-stone-400">No categories yet.</p>}
      </ul>
    </div>
  );
}
