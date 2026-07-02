"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

async function token() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session.user.accessToken;
}

export async function createCompany(formData: FormData) {
  const t = await token();
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const adminEmail = (formData.get("adminEmail") as string)?.trim();
  const adminName = (formData.get("adminName") as string)?.trim();
  const adminPassword = (formData.get("adminPassword") as string)?.trim();

  if (!name || !adminEmail || !adminName || !adminPassword) return;

  await api("/super/companies", {
    method: "POST",
    token: t,
    body: JSON.stringify({ restaurantName: name, address: address || undefined, phone: phone || undefined, adminEmail, adminName, adminPassword }),
  });
  revalidatePath("/super-admin/companies");
}

export async function toggleCompany(id: string) {
  const t = await token();
  await api(`/super/companies/${id}/toggle`, { method: "PATCH", token: t });
  revalidatePath("/super-admin/companies");
  revalidatePath("/super-admin");
}

export async function deleteCompany(id: string) {
  const t = await token();
  await api(`/super/companies/${id}`, { method: "DELETE", token: t });
  revalidatePath("/super-admin/companies");
  revalidatePath("/super-admin");
}
