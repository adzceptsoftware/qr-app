import type { Request, Response } from "express";
import type { AuthRequest, OrderStatus } from "../types";
import Table from "../models/table.model";
import MenuItem from "../models/menu-item.model";
import Order from "../models/order.model";

const VALID_STATUSES: OrderStatus[] = ["RECEIVED", "PREPARING", "READY", "SERVED", "CANCELLED"];

export async function listActive(req: AuthRequest, res: Response) {
  const orders = await Order.find({
    restaurantId: req.user!.restaurantId,
    status: { $in: ["RECEIVED", "PREPARING", "READY", "SERVED"] },
  }).sort({ createdAt: -1 }).limit(50);

  res.json(orders.map((o) => ({
    id: o._id.toString(), status: o.status, total: o.total,
    createdAt: o.createdAt.toISOString(), tableNumber: o.tableNumber,
    items: o.items.map((i: { _id: { toString(): string }; name: string; qty: number }) => ({ id: i._id.toString(), name: i.name, qty: i.qty })),
  })));
}

export async function create(req: Request, res: Response) {
  const { tableToken, items } = req.body as {
    tableToken?: string;
    items?: { menuItemId: string; qty: number }[];
  };

  if (!tableToken || !items?.length) {
    res.status(400).json({ message: "tableToken and items required" }); return;
  }

  const table = await Table.findOne({ token: tableToken });
  if (!table) { res.status(404).json({ message: "Invalid table" }); return; }

  const menuItems = await MenuItem.find({ _id: { $in: items.map((i) => i.menuItemId) }, available: true });
  if (menuItems.length !== items.length) {
    res.status(400).json({ message: "Some items are unavailable" }); return;
  }

  const priceMap = new Map(menuItems.map((m) => [m._id.toString(), m.price]));
  const nameMap  = new Map(menuItems.map((m) => [m._id.toString(), m.name]));
  const total = items.reduce((s, i) => s + (priceMap.get(i.menuItemId) ?? 0) * i.qty, 0);

  const order = await Order.create({
    tableId: table._id, tableNumber: table.tableNumber, restaurantId: table.restaurantId,
    total,
    items: items.map((i) => ({
      menuItemId: i.menuItemId, name: nameMap.get(i.menuItemId) ?? "",
      qty: i.qty, price: priceMap.get(i.menuItemId) ?? 0,
    })),
  });

  res.status(201).json({ id: order._id.toString() });
}

export async function updateStatus(req: AuthRequest, res: Response) {
  const { status } = req.body as { status?: OrderStatus };
  if (!status || !VALID_STATUSES.includes(status)) {
    res.status(400).json({ message: "Invalid status" }); return;
  }

  const order = await Order.findOneAndUpdate(
    { _id: req.params.id, restaurantId: req.user!.restaurantId },
    { status },
    { new: true }
  );
  if (!order) { res.status(404).json({ message: "Not found" }); return; }

  res.json({ id: order._id.toString(), status: order.status });
}
