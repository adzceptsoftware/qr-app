import type { Metadata } from "next";
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

  const [initialOrders, settings] = await Promise.all([
    api<OrderDTO[]>("/orders", { token }),
    api<Settings>("/restaurant/settings", { token }),
  ]);

  return <KitchenClient initialOrders={initialOrders} restaurantName={settings.name} />;
}
