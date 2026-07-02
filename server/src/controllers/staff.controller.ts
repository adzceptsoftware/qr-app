import type { Response } from "express";
import bcrypt from "bcryptjs";
import type { AuthRequest } from "../types";
import Staff from "../models/staff.model";

export async function listKitchenStaff(req: AuthRequest, res: Response) {
  const staff = await Staff.find({ restaurantId: req.user!.restaurantId, role: "KITCHEN" }).sort({ name: 1 });
  res.json(staff.map((s) => ({ id: s._id.toString(), name: s.name, username: s.username })));
}

export async function createKitchenStaff(req: AuthRequest, res: Response) {
  const { name, username, password } = req.body as { name?: string; username?: string; password?: string };

  if (!name?.trim() || !username?.trim() || !password) {
    res.status(400).json({ message: "name, username, password required" });
    return;
  }
  if (password.length < 6) {
    res.status(400).json({ message: "Password must be at least 6 characters" });
    return;
  }

  const normalizedUsername = username.trim().toLowerCase();
  const existing = await Staff.findOne({ username: normalizedUsername });
  if (existing) {
    res.status(409).json({ message: "That username is already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const staff = await Staff.create({
    name: name.trim(),
    username: normalizedUsername,
    passwordHash,
    role: "KITCHEN",
    restaurantId: req.user!.restaurantId,
  });

  res.status(201).json({ id: staff._id.toString(), name: staff.name, username: staff.username });
}

export async function removeKitchenStaff(req: AuthRequest, res: Response) {
  await Staff.deleteOne({ _id: req.params.id, restaurantId: req.user!.restaurantId, role: "KITCHEN" });
  res.json({ message: "Deleted" });
}
