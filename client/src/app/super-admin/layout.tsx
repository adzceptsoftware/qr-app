import { signOut } from "@/lib/auth";
import { SuperAdminNav } from "./super-admin-nav";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <SuperAdminNav onSignOut={handleSignOut} />
      <main className="p-3 sm:p-6">{children}</main>
    </div>
  );
}
