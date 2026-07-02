import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toggleCompany, deleteCompany } from "./actions";
import { CreateCompanyForm } from "./create-company-form";

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

      <CreateCompanyForm />

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
