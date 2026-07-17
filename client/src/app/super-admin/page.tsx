import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import Link from "next/link";
import { PageHeader, Card } from "@/components/dashboard/ui";

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

  const cards = [
    { label: "Total Hotels", value: stats.totalCompanies, accent: "text-foreground" },
    { label: "Active Hotels", value: stats.activeCompanies, accent: "text-emerald-600" },
    { label: "Total Orders", value: stats.totalOrders, accent: "text-indigo-600" },
    { label: "Today's Orders", value: stats.todayOrders, accent: "text-amber-600" },
  ];

  return (
    <div>
      <PageHeader title="Platform Overview" description="Activity across every hotel on the platform." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <Card key={s.label} className="p-5">
            <p className="text-sm font-medium text-muted">{s.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${s.accent}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-bold text-foreground">Recent Hotels</h2>
          <Link href="/super-admin/companies" className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">
            View all →
          </Link>
        </div>
        <ul className="divide-y divide-border">
          {recentCompanies.map((c) => (
            <li key={c.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600">
                  {c.name.charAt(0).toUpperCase()}
                </span>
                <div>
                  <p className="text-base font-semibold text-foreground">{c.name}</p>
                  {c.address && <p className="text-sm text-muted">{c.address}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="hidden text-sm text-muted sm:block">{c.orderCount} orders</span>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    c.active ? "bg-emerald-50 text-emerald-700" : "bg-danger/10 text-danger"
                  }`}
                >
                  {c.active ? "Active" : "Inactive"}
                </span>
              </div>
            </li>
          ))}
          {recentCompanies.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-muted">No hotels yet.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
