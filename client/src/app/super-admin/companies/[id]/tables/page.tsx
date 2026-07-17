import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { generateQrDataUrl } from "@/lib/qr";
import { PageHeader, Card, EmptyState, inputClass, btnPrimary } from "@/components/dashboard/ui";
import { createTable } from "./actions";
import { TableCard } from "./table-card";

type Table = { id: string; tableNumber: string; token: string };
type Company = { id: string; name: string };

export default async function CompanyTablesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: companyId } = await params;
  const session = await auth();
  const token = session!.user.accessToken;

  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const [companies, tables] = await Promise.all([
    api<Company[]>("/super/companies", { token }),
    api<Table[]>(`/super/companies/${companyId}/tables`, { token }),
  ]);

  const company = companies.find((c) => c.id === companyId);

  const tablesWithQr = await Promise.all(
    tables.map(async (t) => ({
      ...t,
      menuUrl: `${baseUrl}/menu/${t.token}`,
      qrDataUrl: await generateQrDataUrl(`${baseUrl}/menu/${t.token}`),
    }))
  );

  return (
    <div>
      <Link
        href="/super-admin/companies"
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-800"
      >
        ← All Hotels
      </Link>

      <PageHeader
        title={company ? `${company.name} — QR Codes` : "QR Codes"}
        description="Generate a QR code for each table, room, lobby or area — guests scan it to open this hotel's menu."
      />

      <Card className="mb-6 p-5">
        <form action={createTable.bind(null, companyId)} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-muted">New location name</label>
            <input name="tableNumber" placeholder="e.g. Table 4, Room 12, Lobby, Poolside" required className={inputClass} />
          </div>
          <button className={btnPrimary}>Add QR code</button>
        </form>
      </Card>

      {tablesWithQr.length === 0 ? (
        <EmptyState title="No tables yet" hint="Add a table above to generate its QR code." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {tablesWithQr.map((t) => (
            <TableCard key={t.id} companyId={companyId} table={t} />
          ))}
        </div>
      )}
    </div>
  );
}
