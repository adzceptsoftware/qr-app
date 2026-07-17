import type { Request, Response } from "express";
import Table from "../models/table.model";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";
import Restaurant from "../models/restaurant.model";

type LeanItem = {
  _id: { toString(): string };
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  badge?: string;
  available: boolean;
};

function toItemDTO(m: LeanItem) {
  return {
    id: m._id.toString(), name: m.name, description: m.description,
    price: m.price, imageUrl: m.imageUrl, badge: m.badge, available: m.available,
  };
}

export async function getMenu(req: Request, res: Response) {
  const table = await Table.findOne({ token: req.params.token }).populate<{
    restaurantId: { _id: { toString(): string }; name: string; address?: string; phone?: string; active: boolean; heroImages: string[] };
  }>("restaurantId");

  if (!table) { res.status(404).json({ message: "Table not found" }); return; }
  if (!table.restaurantId.active) {
    res.status(403).json({ message: "Restaurant is currently closed" }); return;
  }

  const categories = await Category.find({ restaurantId: table.restaurantId._id }).sort({ position: 1 }).lean();
  const availableItems = await MenuItem.find({
    categoryId: { $in: categories.map((c) => c._id) },
    available: true,
  }).sort({ name: 1 }).lean();

  // Group available items by their categoryId (which may be a category or a subcategory).
  const itemsByCategory = new Map<string, ReturnType<typeof toItemDTO>[]>();
  for (const m of availableItems) {
    const key = m.categoryId.toString();
    if (!itemsByCategory.has(key)) itemsByCategory.set(key, []);
    itemsByCategory.get(key)!.push(toItemDTO(m));
  }

  const topLevel = categories.filter((c) => !c.parentId);
  const subsByParent = new Map<string, typeof categories>();
  for (const c of categories) {
    if (!c.parentId) continue;
    const key = c.parentId.toString();
    if (!subsByParent.has(key)) subsByParent.set(key, []);
    subsByParent.get(key)!.push(c);
  }

  const categoriesWithItems = topLevel.map((c) => ({
    id: c._id.toString(),
    name: c.name,
    imageUrl: c.imageUrl ?? null,
    menuItems: itemsByCategory.get(c._id.toString()) ?? [],
    subcategories: (subsByParent.get(c._id.toString()) ?? []).map((s) => ({
      id: s._id.toString(),
      name: s.name,
      imageUrl: s.imageUrl ?? null,
      menuItems: itemsByCategory.get(s._id.toString()) ?? [],
    })),
  }));

  res.json({
    restaurant: {
      id: table.restaurantId._id.toString(),
      name: table.restaurantId.name,
      address: table.restaurantId.address,
      phone: table.restaurantId.phone,
      heroImages: table.restaurantId.heroImages ?? [],
    },
    tableNumber: table.tableNumber,
    tableToken: table.token,
    categories: categoriesWithItems,
  });
}
