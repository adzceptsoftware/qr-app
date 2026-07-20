import type { Metadata } from "next";
import { auth, signOut } from "@/lib/auth";
import { api } from "@/lib/api";
import { AdminNav } from "./admin-nav";

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  if (!session?.user) return {};
  try {
    const settings = await api<{ name: string }>("/restaurant/settings", { token: session.user.accessToken });
    return { title: settings.name };
  } catch {
    return {};
  }
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return <AdminNav onSignOut={handleSignOut}>{children}</AdminNav>;
}
