import Link from "next/link";
import { signOut } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="flex items-center gap-3 border-b border-stone-200 bg-white px-3 py-3 sm:gap-6 sm:px-6 sm:py-3.5">
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xl">🏨</span>
          <span className="hidden font-bold text-stone-900 text-sm sm:inline">Admin</span>
        </div>
        <div className="flex flex-1 items-center gap-4 overflow-x-auto scrollbar-hide">
          <Link href="/admin/categories" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Categories
          </Link>
          <Link href="/admin/menu-items" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Menu Items
          </Link>
          <Link href="/admin/tables" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Tables & QR
          </Link>
          <Link href="/admin/hero-images" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Menu Photos
          </Link>
          <Link href="/admin/kitchen-staff" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Kitchen Accounts
          </Link>
          <Link href="/kitchen" className="shrink-0 whitespace-nowrap text-sm text-stone-500 hover:text-stone-900 transition-colors">
            Kitchen View
          </Link>
        </div>
        <form
          className="shrink-0"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded-lg border border-stone-200 px-2.5 py-1.5 text-xs text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors sm:px-3 sm:text-sm">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-3 sm:p-6">{children}</main>
    </div>
  );
}
