import type { Request, Response, NextFunction } from "express";

export function errorHandler(err: Error & { code?: number; keyPattern?: Record<string, unknown> }, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  if (err.code === 11000) {
    const field = err.keyPattern ? Object.keys(err.keyPattern)[0] : "value";
    res.status(409).json({ message: `That ${field} is already in use` });
    return;
  }

  res.status(500).json({ message: err.message ?? "Internal server error" });
}
