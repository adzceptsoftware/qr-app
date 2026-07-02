import Link from "next/link";
import { signOut } from "@/lib/auth";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <nav className="flex items-center gap-6 border-b border-stone-200 bg-white px-6 py-3.5">
        <div className="flex items-center gap-2 mr-4">
          <span className="text-xl">🏨</span>
          <span className="font-bold text-stone-900 text-sm">Admin</span>
        </div>
        <Link href="/admin/categories" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Categories
        </Link>
        <Link href="/admin/menu-items" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Menu Items
        </Link>
        <Link href="/admin/tables" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Tables & QR
        </Link>
        <Link href="/kitchen" className="text-sm text-stone-500 hover:text-stone-900 transition-colors">
          Kitchen View
        </Link>
        <form
          className="ml-auto"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button className="rounded-lg border border-stone-200 px-3 py-1.5 text-sm text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors">
            Sign out
          </button>
        </form>
      </nav>
      <main className="p-6">{children}</main>
    </div>
  );
}
