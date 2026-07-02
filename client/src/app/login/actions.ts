"use server";

import { signIn } from "@/lib/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const callbackUrl = formData.get("callbackUrl") as string;

  // /auth/redirect reads the session and sends each role to the right dashboard
  const destination = callbackUrl || "/auth/redirect";

  try {
    await signIn("credentials", { email, password, redirectTo: destination });
  } catch (error) {
    if (error instanceof AuthError) {
      redirect(`/login?error=1&callbackUrl=${encodeURIComponent(callbackUrl ?? "")}`);
    }
    throw error;
  }
}
