import type { Request, Response } from "express";
import Table from "../models/table.model";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";
import Restaurant from "../models/restaurant.model";

export async function getMenu(req: Request, res: Response) {
  const table = await Table.findOne({ token: req.params.token }).populate<{
    restaurantId: { _id: { toString(): string }; name: string; address?: string; phone?: string; active: boolean };
  }>("restaurantId");

  if (!table) { res.status(404).json({ message: "Table not found" }); return; }
  if (!table.restaurantId.active) {
    res.status(403).json({ message: "Restaurant is currently closed" }); return;
  }

  const categories = await Category.find({ restaurantId: table.restaurantId._id }).sort({ position: 1 }).lean();

  const categoriesWithItems = await Promise.all(
    categories.map(async (c) => {
      const items = await MenuItem.find({ categoryId: c._id, available: true }).sort({ name: 1 }).lean();
      return {
        id: c._id.toString(), name: c.name, icon: c.icon,
        menuItems: items.map((m) => ({
          id: m._id.toString(), name: m.name, description: m.description,
          price: m.price, imageUrl: m.imageUrl, badge: m.badge, available: m.available,
        })),
      };
    })
  );

  res.json({
    restaurant: {
      id: table.restaurantId._id.toString(),
      name: table.restaurantId.name,
      address: table.restaurantId.address,
      phone: table.restaurantId.phone,
    },
    tableNumber: table.tableNumber,
    tableToken: table.token,
    categories: categoriesWithItems,
  });
}
