"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, inputClass, labelClass, btnPrimary, btnSecondary } from "@/components/dashboard/ui";
import { createKitchenStaff, updateKitchenStaff } from "./actions";

type KitchenStaffMember = { id: string; name: string; username: string };

export function KitchenStaffForm({
  editingMember,
  onDone,
  onCancel,
}: {
  editingMember: KitchenStaffMember | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const isEditing = !!editingMember;

  return (
    <Card key={editingMember?.id ?? "new"} className={`p-5 ${isEditing ? "ring-2 ring-accent/30" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-foreground">{isEditing ? "Edit account" : "New kitchen account"}</h2>
        {isEditing && (
          <span className="rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
            Editing
          </span>
        )}
      </div>

      <form
        action={async (formData) => {
          setError(null);
          try {
            if (editingMember) await updateKitchenStaff(editingMember.id, formData);
            else await createKitchenStaff(formData);
            onDone();
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not save account");
          }
        }}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-lg border border-danger/20 bg-danger/10 px-3 py-2.5 text-sm text-danger">{error}</div>
        )}
        <div>
          <label className={labelClass}>Full name</label>
          <input name="name" defaultValue={editingMember?.name ?? ""} placeholder="Jane Cook" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Username</label>
          <input name="username" defaultValue={editingMember?.username ?? ""} placeholder="janecook" required className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>{isEditing ? "New password" : "Password"}</label>
          <PasswordInput
            name="password"
            placeholder={isEditing ? "Leave blank to keep current" : "Min 6 characters"}
            required={!isEditing}
            autoComplete="new-password"
            className={`${inputClass} pr-10`}
          />
        </div>
        <div className="flex gap-2">
          <button className={`${btnPrimary} flex-1`}>{isEditing ? "Save changes" : "Create account"}</button>
          {isEditing && (
            <button type="button" onClick={onCancel} className={btnSecondary}>
              Cancel
            </button>
          )}
        </div>
      </form>
    </Card>
  );
}
