import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/ui";
import { CreateCompanyForm } from "./create-company-form";
import { CompaniesList } from "./companies-list";

type Company = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  active: boolean;
  adminCount: number;
  orderCount: number;
};

export default async function CompaniesPage() {
  const session = await auth();
  const companies = await api<Company[]>("/super/companies", { token: session!.user.accessToken });

  return (
    <div>
      <PageHeader title="Hotels" description="Onboard new hotels and manage their access to the platform." />

      <CreateCompanyForm />

      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-base font-bold text-foreground">All Hotels</h2>
        <span className="text-sm text-muted">{companies.length} total</span>
      </div>
      <CompaniesList companies={companies} />
    </div>
  );
}
