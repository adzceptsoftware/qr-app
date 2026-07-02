export type OrderStatus = "RECEIVED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";

export type OrderDTO = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  tableNumber: string;
  items: { id: string; name: string; qty: number }[];
};
