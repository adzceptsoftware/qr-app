"use server";

import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function updateHeroImages(formData: FormData) {
  const session = await auth();
  if (!session?.user) return;

  const heroImages = formData
    .getAll("heroImages")
    .map((v) => (v as string).trim())
    .filter(Boolean)
    .slice(0, 3);

  await api("/restaurant/hero-images", {
    method: "PATCH",
    token: session.user.accessToken,
    body: JSON.stringify({ heroImages }),
  });
  revalidatePath("/admin/hero-images");
}
