"use client";

import { useRef, useState } from "react";
import { KitchenStaffForm } from "./kitchen-staff-form";
import { KitchenStaffList } from "./kitchen-staff-list";

type KitchenStaffMember = { id: string; name: string; username: string };

export function KitchenStaffManager({ staff }: { staff: KitchenStaffMember[] }) {
  const [editing, setEditing] = useState<KitchenStaffMember | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  function handleEdit(member: KitchenStaffMember) {
    setEditing(member);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr] lg:items-start">
      <div ref={formRef} className="lg:sticky lg:top-6">
        <KitchenStaffForm editingMember={editing} onDone={() => setEditing(null)} onCancel={() => setEditing(null)} />
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <h2 className="text-base font-bold text-foreground">Team</h2>
          <span className="text-sm text-muted">{staff.length} account{staff.length !== 1 ? "s" : ""}</span>
        </div>
        <KitchenStaffList staff={staff} onEdit={handleEdit} editingId={editing?.id ?? null} />
      </div>
    </div>
  );
}
