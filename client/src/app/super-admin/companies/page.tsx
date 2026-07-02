import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { createCompany, toggleCompany, deleteCompany } from "./actions";

type Company = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  adminCount: number;
  orderCount: number;
};

export default async function CompaniesPage() {
  const session = await auth();
  const companies = await api<Company[]>("/super/companies", { token: session!.user.accessToken });

  return (
    <div className="max-w-4xl">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Hotels</h1>

      {/* Add hotel form */}
      <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Add New Hotel</h2>
        <form action={createCompany} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Hotel Name *</label>
              <input name="name" required placeholder="e.g. Grand Ocean Hotel"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
              <input name="phone" placeholder="+1 555 000 0000"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Address</label>
            <input name="address" placeholder="123 Beach Rd, Colombo"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div className="border-t border-slate-100 pt-3">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Account</p>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Name *</label>
                <input name="adminName" required placeholder="Jane Smith"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
                <input name="adminEmail" required type="email" placeholder="admin@hotel.com"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Password *</label>
                <input name="adminPassword" required type="password" placeholder="min 6 chars"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
              Create Hotel
            </button>
          </div>
        </form>
      </div>

      {/* Hotels list */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">All Hotels ({companies.length})</h2>
        </div>
        <ul className="divide-y divide-slate-100">
          {companies.map((c) => (
            <li key={c.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    c.active ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                  }`}>
                    {c.active ? "Active" : "Inactive"}
                  </span>
                </div>
                {c.address && <p className="text-xs text-slate-400 mt-0.5">{c.address}</p>}
                {c.phone && <p className="text-xs text-slate-400">{c.phone}</p>}
                <p className="mt-1 text-xs text-slate-400">
                  {c.adminCount} admin{c.adminCount !== 1 ? "s" : ""} · {c.orderCount} orders
                </p>
              </div>
              <div className="flex items-center gap-2">
                <form action={toggleCompany.bind(null, c.id)}>
                  <button className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                    c.active
                      ? "border border-amber-300 text-amber-700 hover:bg-amber-50"
                      : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                  }`}>
                    {c.active ? "Deactivate" : "Activate"}
                  </button>
                </form>
                <form action={deleteCompany.bind(null, c.id)}>
                  <button className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
          {companies.length === 0 && (
            <li className="px-5 py-12 text-center text-sm text-slate-400">
              No hotels yet. Create the first one above.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
