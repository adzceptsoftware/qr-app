import type { Response } from "express";
import type { AuthRequest } from "../types";

export async function uploadImage(req: AuthRequest, res: Response) {
  if (!req.file) { res.status(400).json({ message: "No file uploaded" }); return; }
  const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}
