import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";

type Stats = {
  totalCompanies: number;
  activeCompanies: number;
  totalOrders: number;
  todayOrders: number;
};

type Company = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  adminCount: number;
  orderCount: number;
};

export default async function SuperAdminDashboard() {
  const session = await auth();
  const token = session!.user.accessToken;

  const [stats, companies] = await Promise.all([
    api<Stats>("/super/stats", { token }),
    api<Company[]>("/super/companies", { token }),
  ]);

  const recentCompanies = companies.slice(0, 5);

  return (
    <div className="max-w-5xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Platform Overview</h1>

      {/* Stats grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Hotels", value: stats.totalCompanies, color: "text-slate-900" },
          { label: "Active Hotels", value: stats.activeCompanies, color: "text-emerald-700" },
          { label: "Total Orders", value: stats.totalOrders, color: "text-blue-700" },
          { label: "Today's Orders", value: stats.todayOrders, color: "text-amber-700" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className={`mt-1 text-3xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent companies */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">Recent Hotels</h2>
          <Link href="/super-admin/companies" className="text-sm text-blue-600 hover:text-blue-800">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-slate-100">
          {recentCompanies.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="font-medium text-slate-900">{c.name}</p>
                {c.address && <p className="text-xs text-slate-400">{c.address}</p>}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-slate-400">{c.orderCount} orders</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  c.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                }`}>
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
            </li>
          ))}
          {recentCompanies.length === 0 && (
            <li className="px-5 py-8 text-center text-sm text-slate-400">No hotels yet.</li>
          )}
        </ul>
      </div>
    </div>
  );
}
