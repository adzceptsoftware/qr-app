"use client";

import { PaginatedList } from "@/components/dashboard/paginated-list";
import { iconEdit, iconDelete, PencilIcon, TrashIcon } from "@/components/dashboard/ui";
import { deleteKitchenStaff } from "./actions";

type KitchenStaffMember = { id: string; name: string; username: string };

export function KitchenStaffList({
  staff,
  onEdit,
  editingId,
}: {
  staff: KitchenStaffMember[];
  onEdit: (member: KitchenStaffMember) => void;
  editingId: string | null;
}) {
  return (
    <PaginatedList
      items={staff}
      getKey={(s) => s.id}
      getSearchText={(s) => `${s.name} ${s.username}`}
      searchPlaceholder="Search staff…"
      pageSize={12}
      emptyTitle="No kitchen accounts yet"
      emptyHint="Create an account so kitchen staff can log in."
      renderItem={(s) => (
        <li
          className={`flex items-center justify-between rounded-2xl border bg-surface px-4 py-3.5 shadow-sm transition-colors ${
            s.id === editingId ? "border-accent ring-2 ring-accent/30" : "border-border hover:border-muted/40"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-base font-bold text-accent">
              {s.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <p className="text-base font-semibold text-foreground">{s.name}</p>
              <p className="text-sm text-muted">@{s.username}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit(s)} className={iconEdit} aria-label="Edit account" title="Edit">
              <PencilIcon />
            </button>
            <form action={deleteKitchenStaff.bind(null, s.id)}>
              <button className={iconDelete} aria-label="Delete account" title="Delete">
                <TrashIcon />
              </button>
            </form>
          </div>
        </li>
      )}
    />
  );
}
