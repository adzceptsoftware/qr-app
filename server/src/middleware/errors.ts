import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error & { code?: number; keyPattern?: Record<string, unknown> }, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err.code === 11000) {
    // For compound indexes, restaurantId is just internal tenant scoping and
    // never the field the user actually collided on — prefer any other key.
    const keys = err.keyPattern ? Object.keys(err.keyPattern) : [];
    const field = keys.find((k) => k !== "restaurantId") ?? keys[0] ?? "value";
    res.status(409).json({ message: `That ${field} is already in use` });
    return;
  }

  res.status(500).json({ message: err.message ?? "Internal server error" });
}
