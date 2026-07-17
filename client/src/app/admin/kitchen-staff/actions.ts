"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function createKitchenStaff(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!name || !username || !password) return;

  await api("/kitchen-staff", {
    method: "POST",
    token: session.user.accessToken,
    body: JSON.stringify({ name, username, password }),
  });
  revalidatePath("/admin/kitchen-staff");
}

export async function updateKitchenStaff(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const name = (formData.get("name") as string)?.trim();
  const username = (formData.get("username") as string)?.trim();
  const password = (formData.get("password") as string)?.trim();

  if (!name || !username) return;

  await api(`/kitchen-staff/${id}`, {
    method: "PATCH",
    token: session.user.accessToken,
    body: JSON.stringify({ name, username, ...(password ? { password } : {}) }),
  });
  revalidatePath("/admin/kitchen-staff");
}

export async function deleteKitchenStaff(id: string) {
  const session = await auth();
  if (!session?.user) return;

  await api(`/kitchen-staff/${id}`, { method: "DELETE", token: session.user.accessToken });
  revalidatePath("/admin/kitchen-staff");
}
