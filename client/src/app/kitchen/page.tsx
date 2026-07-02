import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { KitchenClient } from "./kitchen-client";
import type { OrderDTO } from "@/lib/order-types";

export default async function KitchenPage() {
  const session = await auth();
  const initialOrders = await api<OrderDTO[]>("/orders", { token: session!.user.accessToken });
  return <KitchenClient initialOrders={initialOrders} />;
}
