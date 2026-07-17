"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

async function token() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.accessToken;
}

export async function createTable(companyId: string, formData: FormData) {
  const t = await token();
  const tableNumber = (formData.get("tableNumber") as string)?.trim();
  if (!tableNumber) return;

  await api(`/super/companies/${companyId}/tables`, {
    method: "POST",
    token: t,
    body: JSON.stringify({ tableNumber }),
  });
  revalidatePath(`/super-admin/companies/${companyId}/tables`);
}

export async function updateTable(companyId: string, id: string, formData: FormData) {
  const t = await token();
  const tableNumber = (formData.get("tableNumber") as string)?.trim();
  if (!tableNumber) return;

  await api(`/super/companies/${companyId}/tables/${id}`, {
    method: "PATCH",
    token: t,
    body: JSON.stringify({ tableNumber }),
  });
  revalidatePath(`/super-admin/companies/${companyId}/tables`);
}

export async function deleteTable(companyId: string, id: string) {
  const t = await token();
  await api(`/super/companies/${companyId}/tables/${id}`, { method: "DELETE", token: t });
  revalidatePath(`/super-admin/companies/${companyId}/tables`);
}
