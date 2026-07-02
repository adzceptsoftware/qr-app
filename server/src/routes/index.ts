import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { listCompanies, createCompany, toggleCompany, deleteCompany, getCompanyStats } from "../controllers/super.controller";
import * as categories from "../controllers/categories.controller";
import * as menuItems from "../controllers/menu-items.controller";
import * as tables from "../controllers/tables.controller";
import * as orders from "../controllers/orders.controller";
import { getMenu } from "../controllers/menu.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();

// ── Auth ──────────────────────────────────────────────────
router.post("/auth/login", login);

// ── Super Admin (platform owner) ─────────────────────────
router.get(   "/super/stats",              requireAuth, requireRole("SUPERADMIN"), getCompanyStats);
router.get(   "/super/companies",          requireAuth, requireRole("SUPERADMIN"), listCompanies);
router.post(  "/super/companies",          requireAuth, requireRole("SUPERADMIN"), createCompany);
router.patch( "/super/companies/:id/toggle", requireAuth, requireRole("SUPERADMIN"), toggleCompany);
router.delete("/super/companies/:id",      requireAuth, requireRole("SUPERADMIN"), deleteCompany);

// ── Hotel Admin ───────────────────────────────────────────
router.get(   "/categories",     requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), categories.list);
router.post(  "/categories",     requireAuth, requireRole("ADMIN"), categories.create);
router.delete("/categories/:id", requireAuth, requireRole("ADMIN"), categories.remove);

router.get(   "/menu-items",     requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), menuItems.list);
router.post(  "/menu-items",     requireAuth, requireRole("ADMIN"), menuItems.create);
router.patch( "/menu-items/:id", requireAuth, requireRole("ADMIN"), menuItems.update);
router.delete("/menu-items/:id", requireAuth, requireRole("ADMIN"), menuItems.remove);

router.get(   "/tables",     requireAuth, requireRole("ADMIN"), tables.list);
router.post(  "/tables",     requireAuth, requireRole("ADMIN"), tables.create);
router.delete("/tables/:id", requireAuth, requireRole("ADMIN"), tables.remove);

// ── Kitchen ───────────────────────────────────────────────
router.get(   "/orders",              requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), orders.listActive);
router.patch( "/orders/:id/status",   requireAuth, requireRole("ADMIN", "KITCHEN"), orders.updateStatus);

// ── Customer (public) ─────────────────────────────────────
router.post("/orders", orders.create);
router.get( "/menu/:token", getMenu);

export default router;
