import Link from "next/link";
import { signOut } from "@/lib/auth";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="flex items-center gap-3 border-b border-slate-200 bg-slate-900 px-3 py-3 sm:gap-6 sm:px-6 sm:py-3.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xl">🏢</span>
          <span className="hidden font-bold text-white text-sm sm:inline">Platform Admin</span>
        </div>
        <div className="flex flex-1 items-center gap-4 overflow-x-auto scrollbar-hide">
          <Link href="/super-admin" className="shrink-0 whitespace-nowrap text-sm text-slate-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/super-admin/companies" className="shrink-0 whitespace-nowrap text-sm text-slate-300 hover:text-white transition-colors">
            Hotels
          </Link>
        </div>
        <form
          className="shrink-0"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded-lg border border-slate-600 px-2.5 py-1.5 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors sm:px-3 sm:text-sm">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-3 sm:p-6">{children}</main>
    </div>
  );
}
