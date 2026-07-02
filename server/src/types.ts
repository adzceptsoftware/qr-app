import type { Request } from "express";

export type Role = "SUPERADMIN" | "ADMIN" | "KITCHEN";

export interface JwtPayload {
  id: string;
  role: Role;
  restaurantId?: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export type OrderStatus = "RECEIVED" | "PREPARING" | "READY" | "SERVED" | "CANCELLED";
