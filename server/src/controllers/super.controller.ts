import type { Response } from "express";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../types";
import Restaurant from "../models/restaurant.model";
import Staff from "../models/staff.model";
import Table from "../models/table.model";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";
import Order from "../models/order.model";

export async function listCompanies(_req: AuthRequest, res: Response) {
  const restaurants = await Restaurant.find().sort({ createdAt: -1 }).lean();
  const result = await Promise.all(
    restaurants.map(async (r) => {
      const [adminCount, orderCount] = await Promise.all([
        Staff.countDocuments({ restaurantId: r._id }),
        Order.countDocuments({ restaurantId: r._id }),
      ]);
      return { ...r, id: r._id.toString(), adminCount, orderCount };
    })
  );
  res.json(result);
}

export async function createCompany(req: AuthRequest, res: Response) {
  const { restaurantName, address, phone, adminName, adminEmail, adminPassword } = req.body as {
    restaurantName?: string; address?: string; phone?: string;
    adminName?: string; adminEmail?: string; adminPassword?: string;
  };

  if (!restaurantName || !adminName || !adminEmail || !adminPassword) {
    res.status(400).json({ message: "restaurantName, adminName, adminEmail, adminPassword required" });
    return;
  }

  const restaurant = await Restaurant.create({ name: restaurantName, address, phone });

  const passwordHash = await bcrypt.hash(adminPassword, 10);
  await Staff.create({ name: adminName, email: adminEmail, passwordHash, role: "ADMIN", restaurantId: restaurant._id });

  res.status(201).json({ id: restaurant._id.toString(), name: restaurant.name, active: restaurant.active });
}

export async function toggleCompany(req: AuthRequest, res: Response) {
  const restaurant = await Restaurant.findById(req.params.id);
  if (!restaurant) { res.status(404).json({ message: "Not found" }); return; }

  restaurant.active = !restaurant.active;
  await restaurant.save();

  res.json({ id: restaurant._id.toString(), active: restaurant.active });
}

export async function deleteCompany(req: AuthRequest, res: Response) {
  const id = req.params.id;
  const restaurant = await Restaurant.findById(id);
  if (!restaurant) { res.status(404).json({ message: "Not found" }); return; }

  // Cascade delete everything belonging to this restaurant
  await Promise.all([
    Staff.deleteMany({ restaurantId: id }),
    Order.deleteMany({ restaurantId: id }),
    Table.deleteMany({ restaurantId: id }),
    MenuItem.deleteMany({ categoryId: { $in: await Category.find({ restaurantId: id }).distinct("_id") } }),
    Category.deleteMany({ restaurantId: id }),
    Restaurant.deleteOne({ _id: id }),
  ]);

  res.json({ message: "Company and all data deleted" });
}

export async function getCompanyStats(_req: AuthRequest, res: Response) {
  const [totalHotels, activeHotels, totalOrders] = await Promise.all([
    Restaurant.countDocuments(),
    Restaurant.countDocuments({ active: true }),
    Order.countDocuments(),
  ]);
  res.json({ totalHotels, activeHotels, inactiveHotels: totalHotels - activeHotels, totalOrders });
}
