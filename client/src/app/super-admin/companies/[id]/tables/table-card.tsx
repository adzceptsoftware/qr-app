"use client";

import { useState } from "react";
import { inputClass, btnPrimary, btnSecondary, iconEdit, iconDelete, PencilIcon, TrashIcon } from "@/components/dashboard/ui";
import { deleteTable, updateTable } from "./actions";

type Table = { id: string; tableNumber: string; token: string; menuUrl: string; qrDataUrl: string };

export function TableCard({ companyId, table }: { companyId: string; table: Table }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm transition-colors hover:border-muted/40">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        {editing ? (
          <form
            action={async (formData) => {
              setError(null);
              try {
                await updateTable(companyId, table.id, formData);
                setEditing(false);
              } catch (e) {
                setError(e instanceof Error ? e.message : "Could not save");
              }
            }}
            className="flex w-full items-center gap-2"
          >
            <input name="tableNumber" defaultValue={table.tableNumber} placeholder="e.g. Table 4, Room 12, Lobby" required className={`${inputClass} py-2`} />
            <button type="submit" className={`${btnPrimary} min-h-[44px] px-4 py-2`}>Save</button>
            <button type="button" onClick={() => setEditing(false)} className={`${btnSecondary} min-h-[44px] px-4 py-2`}>✕</button>
          </form>
        ) : (
          <>
            <p className="text-lg font-bold text-foreground">{table.tableNumber}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing(true)} className={iconEdit} aria-label="Edit table" title="Edit">
                <PencilIcon />
              </button>
              <form action={deleteTable.bind(null, companyId, table.id)}>
                <button className={iconDelete} aria-label="Delete table" title="Delete">
                  <TrashIcon />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {error && <p className="px-4 pt-2 text-sm text-danger">{error}</p>}

      <div className="flex flex-col items-center gap-3 p-4">
        <div className="rounded-2xl border border-border bg-background p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={table.qrDataUrl} alt={`QR for ${table.tableNumber}`} className="h-40 w-40" />
        </div>
        <a href={table.menuUrl} target="_blank" className="max-w-full truncate text-sm text-muted hover:text-foreground">
          {table.menuUrl}
        </a>
        <a
          href={table.qrDataUrl}
          download={`qr-${table.tableNumber.trim().replace(/\s+/g, "-").toLowerCase()}.png`}
          className={`${btnSecondary} w-full`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Download QR
        </a>
      </div>
    </div>
  );
}
