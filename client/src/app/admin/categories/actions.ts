"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  const parentId = (formData.get("parentId") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || "";

  await api("/categories", {
    method: "POST",
    token: session.user.accessToken,
    body: JSON.stringify({ name: name.trim(), parentId, imageUrl }),
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu-items");
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  const name = formData.get("name") as string;
  if (!name?.trim()) return;
  const parentId = (formData.get("parentId") as string) || null;
  const imageUrl = (formData.get("imageUrl") as string) || "";

  await api(`/categories/${id}`, {
    method: "PATCH",
    token: session.user.accessToken,
    body: JSON.stringify({ name: name.trim(), parentId, imageUrl }),
  });
  revalidatePath("/admin/categories");
  revalidatePath("/admin/menu-items");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/categories/${id}`, { method: "DELETE", token: session.user.accessToken });
  revalidatePath("/admin/categories");
}
