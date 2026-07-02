import Link from "next/link";
import { signOut } from "@/lib/auth";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center gap-6 border-b border-slate-200 bg-slate-900 px-6 py-3.5">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-xl">🏢</span>
          <span className="font-bold text-white text-sm">Platform Admin</span>
        </div>
        <Link href="/super-admin" className="text-sm text-slate-300 hover:text-white transition-colors">
          Dashboard
        </Link>
        <Link href="/super-admin/companies" className="text-sm text-slate-300 hover:text-white transition-colors">
          Hotels
        </Link>
        <form
          className="ml-auto"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
