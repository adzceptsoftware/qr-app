import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AuthRedirectPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "SUPERADMIN") redirect("/super-admin");
  if (session.user.role === "KITCHEN") redirect("/kitchen");
  redirect("/admin");
}
