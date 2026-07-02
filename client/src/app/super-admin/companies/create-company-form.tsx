"use client";

import { useState } from "react";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { createCompany } from "./actions";

export function CreateCompanyForm() {
  const [error, setError] = useState<string | null>(null);
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 font-semibold text-slate-900">Add New Hotel</h2>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-700">
          {error}
        </div>
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
        className="space-y-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Hotel Name *</label>
            <input name="name" required placeholder="e.g. Grand Ocean Hotel"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Phone</label>
            <input name="phone" placeholder="+1 555 000 0000"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-700">Address</label>
          <input name="address" placeholder="123 Beach Rd, Colombo"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
        </div>
        <div className="border-t border-slate-100 pt-3">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin Account</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Name *</label>
              <input name="adminName" required placeholder="Jane Smith"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Email *</label>
              <input name="adminEmail" required type="email" placeholder="admin@hotel.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400" />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-700">Password *</label>
              <PasswordInput
                name="adminPassword"
                required
                placeholder="min 6 chars"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 transition-colors">
            Create Hotel
          </button>
        </div>
      </form>
    </div>
  );
}
