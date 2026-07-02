"use client";

import { useState } from "react";
import { deleteTable, updateTable } from "./actions";

type Table = { id: string; tableNumber: string; token: string; menuUrl: string; qrDataUrl: string };

export function TableCard({ table }: { table: Table }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-stone-200 bg-white p-4">
      {editing ? (
        <form
          action={async (formData) => {
            setError(null);
            try {
              await updateTable(table.id, formData);
              setEditing(false);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Could not save");
            }
          }}
          className="flex w-full flex-col items-center gap-2"
        >
          {error && <p className="text-xs text-red-600">{error}</p>}
          <input
            name="tableNumber"
            defaultValue={table.tableNumber}
            required
            className="w-full rounded-lg border border-stone-300 px-3 py-1.5 text-center text-sm"
          />
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-stone-700">
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-50"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <p className="font-semibold text-stone-900">Table {table.tableNumber}</p>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={table.qrDataUrl} alt={`QR for table ${table.tableNumber}`} className="h-40 w-40" />
      <a href={table.menuUrl} target="_blank" className="text-xs text-stone-400 hover:text-stone-600">{table.menuUrl}</a>
      <a href={table.qrDataUrl} download={`table-${table.tableNumber}-qr.png`}
        className="text-xs font-medium text-blue-600 hover:text-blue-800">
        Download QR
      </a>
      {!editing && (
        <div className="flex gap-3">
          <button onClick={() => setEditing(true)} className="text-xs font-medium text-stone-600 hover:text-stone-900">
            Edit
          </button>
          <form action={deleteTable.bind(null, table.id)}>
            <button className="text-xs text-red-600 hover:text-red-800">Delete</button>
          </form>
        </div>
      )}
    </div>
  );
}
