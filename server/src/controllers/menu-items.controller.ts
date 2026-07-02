import type { Response } from "express";
import type { AuthRequest } from "../types";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";

export async function list(req: AuthRequest, res: Response) {
  const categories = await Category.find({ restaurantId: req.user!.restaurantId }).lean();
  const catIds = categories.map((c) => c._id);
  const items = await MenuItem.find({ categoryId: { $in: catIds } }).sort({ name: 1 }).lean();
  const catMap = new Map(categories.map((c) => [c._id.toString(), c.name]));

  res.json(items.map((m) => ({
    id: m._id.toString(), name: m.name, description: m.description, price: m.price,
    imageUrl: m.imageUrl, available: m.available, badge: m.badge,
    categoryId: m.categoryId.toString(), categoryName: catMap.get(m.categoryId.toString()),
  })));
}

export async function create(req: AuthRequest, res: Response) {
  const { name, description, price, imageUrl, categoryId, badge } = req.body as {
    name?: string; description?: string; price?: number; imageUrl?: string; categoryId?: string; badge?: string;
  };
  if (!name?.trim() || !price || !categoryId) { res.status(400).json({ message: "name, price, categoryId required" }); return; }

  const category = await Category.findOne({ _id: categoryId, restaurantId: req.user!.restaurantId });
  if (!category) { res.status(403).json({ message: "Category not found" }); return; }

  const item = await MenuItem.create({ name: name.trim(), description, price, imageUrl, badge, categoryId });
  res.status(201).json({ id: item._id.toString(), name: item.name });
}

export async function update(req: AuthRequest, res: Response) {
  const item = await MenuItem.findById(req.params.id).populate<{ categoryId: { restaurantId: { toString(): string } } }>("categoryId");
  if (!item || item.categoryId.restaurantId.toString() !== req.user!.restaurantId) {
    res.status(404).json({ message: "Not found" }); return;
  }
  const { name, description, price, imageUrl, categoryId, badge, available } = req.body as {
    name?: string; description?: string; price?: number; imageUrl?: string;
    categoryId?: string; badge?: string; available?: boolean;
  };

  if (categoryId !== undefined) {
    const category = await Category.findOne({ _id: categoryId, restaurantId: req.user!.restaurantId });
    if (!category) { res.status(403).json({ message: "Category not found" }); return; }
    item.categoryId = category._id;
  }
  if (name !== undefined) {
    if (!name.trim()) { res.status(400).json({ message: "name required" }); return; }
    item.name = name.trim();
  }
  if (price !== undefined) {
    if (!price) { res.status(400).json({ message: "price required" }); return; }
    item.price = price;
  }
  if (description !== undefined) item.description = description.trim() || undefined;
  if (imageUrl !== undefined) item.imageUrl = imageUrl.trim() || undefined;
  if (badge !== undefined) item.badge = badge.trim() || undefined;
  if (available !== undefined) item.available = available;

  await item.save();
  res.json({
    id: item._id.toString(), name: item.name, description: item.description, price: item.price,
    imageUrl: item.imageUrl, available: item.available, badge: item.badge, categoryId: item.categoryId.toString(),
  });
}

export async function remove(req: AuthRequest, res: Response) {
  const item = await MenuItem.findById(req.params.id).populate<{ categoryId: { restaurantId: { toString(): string } } }>("categoryId");
  if (!item || item.categoryId.restaurantId.toString() !== req.user!.restaurantId) {
    res.status(404).json({ message: "Not found" }); return;
  }
  await item.deleteOne();
  res.json({ message: "Deleted" });
}
