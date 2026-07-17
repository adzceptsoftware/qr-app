import { signOut } from "@/lib/auth";
import { SuperAdminNav } from "./super-admin-nav";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return <SuperAdminNav onSignOut={handleSignOut}>{children}</SuperAdminNav>;
}
