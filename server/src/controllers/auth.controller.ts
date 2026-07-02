import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Staff from "../models/staff.model";
import Restaurant from "../models/restaurant.model";

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) { res.status(400).json({ message: "Email and password required" }); return; }

  const staff = await Staff.findOne({ email: email.toLowerCase() });
  if (!staff) { res.status(401).json({ message: "Invalid credentials" }); return; }

  const valid = await bcrypt.compare(password, staff.passwordHash);
  if (!valid) { res.status(401).json({ message: "Invalid credentials" }); return; }

  // Block login if restaurant is inactive (non-superadmin only)
  if (staff.restaurantId) {
    const restaurant = await Restaurant.findById(staff.restaurantId);
    if (!restaurant?.active) {
      res.status(403).json({ message: "This hotel account has been deactivated. Contact support." });
      return;
    }
  }

  const token = jwt.sign(
    { id: staff._id.toString(), role: staff.role, restaurantId: staff.restaurantId?.toString(), name: staff.name },
    process.env.JWT_SECRET!,
    { expiresIn: "12h" }
  );

  res.json({
    token,
    user: { id: staff._id.toString(), name: staff.name, email: staff.email, role: staff.role, restaurantId: staff.restaurantId?.toString() },
  });
}
