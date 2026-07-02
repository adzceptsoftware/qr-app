import { notFound } from "next/navigation";
import { MenuClient } from "./menu-client";
import type { CategoryDTO, RestaurantDTO } from "@/lib/types";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:4000";

type MenuResponse = {
  restaurant: RestaurantDTO;
  tableNumber: string;
  tableToken: string;
  categories: CategoryDTO[];
};

export default async function MenuPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const res = await fetch(`${BACKEND}/api/v1/menu/${token}`, { cache: "no-store" });
  if (res.status === 404 || res.status === 403) notFound();
  if (!res.ok) notFound();

  const data: MenuResponse = await res.json();

  return (
    <MenuClient
      restaurant={data.restaurant}
      categories={data.categories}
      tableToken={data.tableToken}
      tableNumber={data.tableNumber}
    />
  );
}
