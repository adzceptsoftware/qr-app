import { signOut } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return <AdminNav onSignOut={handleSignOut}>{children}</AdminNav>;
}
