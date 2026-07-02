"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createMenuItem(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string;
  const imageUrl = formData.get("imageUrl") as string;

  if (!name?.trim() || !price || !categoryId) return;

  await api("/menu-items", {
    method: "POST",
    token: session.user.accessToken,
    body: JSON.stringify({ name: name.trim(), price: Number(price), categoryId, description: description?.trim() || undefined, imageUrl: imageUrl?.trim() || undefined }),
  });
  revalidatePath("/admin/menu-items");
}

export async function toggleAvailability(id: string, available: boolean) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/menu-items/${id}`, {
    method: "PATCH",
    token: session.user.accessToken,
    body: JSON.stringify({ available }),
  });
  revalidatePath("/admin/menu-items");
}

export async function deleteMenuItem(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/menu-items/${id}`, { method: "DELETE", token: session.user.accessToken });
  revalidatePath("/admin/menu-items");
}
