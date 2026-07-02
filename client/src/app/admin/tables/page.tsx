import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { generateQrDataUrl } from "@/lib/qr";
import { createTable } from "./actions";
import { TableCard } from "./table-card";

type Table = { id: string; tableNumber: string; token: string };

export default async function TablesPage() {
  const session = await auth();
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  const tables = await api<Table[]>("/tables", { token: session!.user.accessToken });

  const tablesWithQr = await Promise.all(
    tables.map(async (t) => ({
      ...t,
      menuUrl: `${baseUrl}/menu/${t.token}`,
      qrDataUrl: await generateQrDataUrl(`${baseUrl}/menu/${t.token}`),
    }))
  );

  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Tables &amp; QR Codes</h1>
      <form action={createTable} className="mb-6 flex gap-2">
        <input name="tableNumber" placeholder="Table number e.g. 4" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Add table
        </button>
      </form>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tablesWithQr.map((t) => (
          <TableCard key={t.id} table={t} />
        ))}
        {tablesWithQr.length === 0 && <p className="text-stone-400">No tables yet.</p>}
      </div>
    </div>
  );
}
