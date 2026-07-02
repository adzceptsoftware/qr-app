import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { KitchenStaffForm } from "./kitchen-staff-form";
import { deleteKitchenStaff } from "./actions";

type KitchenStaffMember = { id: string; name: string; username: string };

export default async function KitchenStaffPage() {
  const session = await auth();
  const staff = await api<KitchenStaffMember[]>("/kitchen-staff", { token: session!.user.accessToken });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Kitchen Accounts</h1>

      <KitchenStaffForm />

      <ul className="space-y-2">
        {staff.map((s) => (
          <li key={s.id} className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-4 py-3">
            <div>
              <p className="font-medium text-stone-900">{s.name}</p>
              <p className="text-sm text-stone-500">@{s.username}</p>
            </div>
            <form action={deleteKitchenStaff.bind(null, s.id)}>
              <button className="text-sm text-red-600 hover:text-red-800">Delete</button>
            </form>
          </li>
        ))}
        {staff.length === 0 && <p className="text-stone-400">No kitchen accounts yet.</p>}
      </ul>
    </div>
  );
}
