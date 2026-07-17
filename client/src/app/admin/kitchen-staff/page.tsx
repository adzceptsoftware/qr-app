import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/ui";
import { KitchenStaffManager } from "./kitchen-staff-manager";

type KitchenStaffMember = { id: string; name: string; username: string };

export default async function KitchenStaffPage() {
  const session = await auth();
  const staff = await api<KitchenStaffMember[]>("/kitchen-staff", { token: session!.user.accessToken });

  return (
    <div>
      <PageHeader title="Kitchen Accounts" description="Give kitchen staff a login to view and update live orders." />
      <KitchenStaffManager staff={staff} />
    </div>
  );
}
