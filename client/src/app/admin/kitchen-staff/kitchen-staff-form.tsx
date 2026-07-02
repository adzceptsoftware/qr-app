"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createKitchenStaff } from "./actions";

export function KitchenStaffForm() {
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <form
      key={formKey}
      action={async (formData) => {
        setError(null);
        try {
          await createKitchenStaff(formData);
          setFormKey((k) => k + 1);
        } catch (e) {
          setError(e instanceof Error ? e.message : "Could not create account");
        }
      }}
      className="mb-6 space-y-2 rounded-xl border border-stone-200 bg-white p-4"
    >
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <input name="name" placeholder="Full name" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
        <input name="username" placeholder="Username" required
          className="flex-1 rounded-lg border border-stone-300 px-3 py-2 text-sm" />
      </div>
      <PasswordInput name="password" placeholder="Password (min 6 chars)" required autoComplete="new-password" />
      <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
        Add kitchen account
      </button>
    </form>
  );
}
