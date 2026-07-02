import { signOut } from "@/lib/auth";
import { AdminNav } from "./admin-nav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <AdminNav onSignOut={handleSignOut} />
      <main className="p-3 sm:p-6">{children}</main>
    </div>
  );
}
