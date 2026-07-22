import type { Response } from "express";
import type { AuthRequest } from "../types";

export async function uploadImage(req: AuthRequest, res: Response) {
  if (!req.file) { res.status(400).json({ message: "No file uploaded" }); return; }
  // Relative URL: the browser resolves it against the site's own domain,
  // so it works behind nginx instead of leaking the backend's localhost host.
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({ url });
}
