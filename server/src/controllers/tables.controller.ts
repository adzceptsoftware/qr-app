import type { Response } from "express";
import type { AuthRequest } from "../types";
import Table from "../models/table.model";

// SUPERADMIN manages tables per company via /super/companies/:companyId/tables,
// so the scope comes from the route param. ADMIN routes fall back to their own restaurant.
function scopeId(req: AuthRequest) {
  return req.params.companyId ?? req.user!.restaurantId;
}

export async function list(req: AuthRequest, res: Response) {
  const tables = await Table.find({ restaurantId: scopeId(req) }).sort({ tableNumber: 1 });
  res.json(tables.map((t) => ({ id: t._id.toString(), tableNumber: t.tableNumber, token: t.token })));
}

export async function create(req: AuthRequest, res: Response) {
  const { tableNumber } = req.body as { tableNumber?: string };
  if (!tableNumber?.trim()) { res.status(400).json({ message: "tableNumber required" }); return; }

  const table = await Table.create({ tableNumber: tableNumber.trim(), restaurantId: scopeId(req) });
  res.status(201).json({ id: table._id.toString(), tableNumber: table.tableNumber, token: table.token });
}

export async function update(req: AuthRequest, res: Response) {
  const { tableNumber } = req.body as { tableNumber?: string };
  if (!tableNumber?.trim()) { res.status(400).json({ message: "tableNumber required" }); return; }

  const table = await Table.findOneAndUpdate(
    { _id: req.params.id, restaurantId: scopeId(req) },
    { tableNumber: tableNumber.trim() },
    { new: true }
  );
  if (!table) { res.status(404).json({ message: "Not found" }); return; }

  res.json({ id: table._id.toString(), tableNumber: table.tableNumber, token: table.token });
}

export async function remove(req: AuthRequest, res: Response) {
  await Table.deleteOne({ _id: req.params.id, restaurantId: scopeId(req) });
  res.json({ message: "Deleted" });
}
