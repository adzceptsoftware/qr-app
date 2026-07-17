import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/ui";
import { CategoriesManager } from "./categories-manager";

type Category = { id: string; name: string; imageUrl?: string | null; parentId?: string | null; itemCount: number };

export default async function CategoriesPage() {
  const session = await auth();
  const categories = await api<Category[]>("/categories", { token: session!.user.accessToken });

  return (
    <div>
      <PageHeader title="Categories" description="Group your menu items into sections customers can browse." />
      <CategoriesManager categories={categories} />
    </div>
  );
}
