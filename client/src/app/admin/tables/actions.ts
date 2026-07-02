"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createTable(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;
  const tableNumber = formData.get("tableNumber") as string;
  if (!tableNumber?.trim()) return;

  await api("/tables", {
    method: "POST",
    token: session.user.accessToken,
    body: JSON.stringify({ tableNumber: tableNumber.trim() }),
  });
  revalidatePath("/admin/tables");
}

export async function deleteTable(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/tables/${id}`, { method: "DELETE", token: session.user.accessToken });
  revalidatePath("/admin/tables");
}
