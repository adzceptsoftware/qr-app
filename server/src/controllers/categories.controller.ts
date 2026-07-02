import type { Response } from "express";
import type { AuthRequest } from "../types";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";

export async function list(req: AuthRequest, res: Response) {
  const categories = await Category.find({ restaurantId: req.user!.restaurantId }).sort({ position: 1 });
  const counts = await MenuItem.aggregate([
    { $match: { categoryId: { $in: categories.map((c) => c._id) } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(counts.map((c) => [c._id.toString(), c.count as number]));

  res.json(categories.map((c) => ({
    id: c._id.toString(), name: c.name, icon: c.icon, position: c.position,
    itemCount: countMap.get(c._id.toString()) ?? 0,
  })));
}

export async function create(req: AuthRequest, res: Response) {
  const { name, icon } = req.body as { name?: string; icon?: string };
  if (!name?.trim()) { res.status(400).json({ message: "Name required" }); return; }

  const count = await Category.countDocuments({ restaurantId: req.user!.restaurantId });
  const category = await Category.create({ name: name.trim(), icon, position: count, restaurantId: req.user!.restaurantId });
  res.status(201).json({ id: category._id.toString(), name: category.name });
}

export async function update(req: AuthRequest, res: Response) {
  const { name, icon } = req.body as { name?: string; icon?: string };

  const category = await Category.findOne({ _id: req.params.id, restaurantId: req.user!.restaurantId });
  if (!category) { res.status(404).json({ message: "Not found" }); return; }

  if (name !== undefined) {
    if (!name.trim()) { res.status(400).json({ message: "Name required" }); return; }
    category.name = name.trim();
  }
  if (icon !== undefined) category.icon = icon.trim() || undefined;

  await category.save();
  res.json({ id: category._id.toString(), name: category.name, icon: category.icon });
}

export async function remove(req: AuthRequest, res: Response) {
  await Category.deleteOne({ _id: req.params.id, restaurantId: req.user!.restaurantId });
  res.json({ message: "Deleted" });
}
