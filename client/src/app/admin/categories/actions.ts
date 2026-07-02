"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;
  const name = formData.get("name") as string;
  if (!name?.trim()) return;

  await api("/categories", {
    method: "POST",
    token: session.user.accessToken,
    body: JSON.stringify({ name: name.trim() }),
  });
  revalidatePath("/admin/categories");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/categories/${id}`, { method: "DELETE", token: session.user.accessToken });
  revalidatePath("/admin/categories");
}
