import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { KitchenClient } from "./kitchen-client";
import type { OrderDTO } from "@/lib/order-types";

type Settings = { name: string };

export async function generateMetadata(): Promise<Metadata> {
  const session = await auth();
  if (!session?.user) return {};
  try {
    const settings = await api<Settings>("/restaurant/settings", { token: session.user.accessToken });
    return { title: `${settings.name} · Kitchen` };
  } catch {
    return {};
  }
}

export default async function KitchenPage() {
  const session = await auth();
  const token = session!.user.accessToken;

  let initialOrders: OrderDTO[];
  let settings: Settings;
  try {
    [initialOrders, settings] = await Promise.all([
      api<OrderDTO[]>("/orders", { token }),
      api<Settings>("/restaurant/settings", { token }),
    ]);
  } catch {
    // The login cookie can outlive the 12h backend token — when the backend
    // rejects it, send staff back through login instead of an error page.
    redirect("/login?callbackUrl=%2Fkitchen");
  }

  return <KitchenClient initialOrders={initialOrders} restaurantName={settings.name} />;
}
