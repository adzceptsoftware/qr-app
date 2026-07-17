"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Card, inputClass, labelClass } from "@/components/dashboard/ui";
import { createCompany } from "./actions";

const btnIndigo =
  "inline-flex items-center justify-center rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/40";

export function CreateCompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <Card className="mb-6 p-6">
      <h2 className="mb-4 text-base font-bold text-foreground">Add New Hotel</h2>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">{error}</div>
      )}

      <form
        key={formKey}
        action={async (formData) => {
          setError(null);
          try {
            await createCompany(formData);
            setFormKey((k) => k + 1);
          } catch (e) {
            setError(e instanceof Error ? e.message : "Could not create hotel");
          }
        }}
        className="space-y-4"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Hotel Name *</label>
            <input name="name" required placeholder="e.g. Grand Ocean Hotel" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Phone</label>
            <input name="phone" placeholder="+1 555 000 0000" className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Address</label>
          <input name="address" placeholder="123 Beach Rd, Colombo" className={inputClass} />
        </div>

        <div className="border-t border-border pt-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted">Admin Account</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className={labelClass}>Name *</label>
              <input name="adminName" required placeholder="Jane Smith" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input name="adminEmail" required type="email" placeholder="admin@hotel.com" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Password *</label>
              <PasswordInput name="adminPassword" required placeholder="min 6 chars" className={`${inputClass} pr-10`} />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className={btnIndigo}>Create Hotel</button>
        </div>
      </form>
    </Card>
  );
}
