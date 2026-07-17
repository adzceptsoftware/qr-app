import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { listCompanies, createCompany, toggleCompany, deleteCompany, getCompanyStats } from "../controllers/super.controller";
import * as categories from "../controllers/categories.controller";
import * as menuItems from "../controllers/menu-items.controller";
import * as tables from "../controllers/tables.controller";
import * as orders from "../controllers/orders.controller";
import * as restaurant from "../controllers/restaurant.controller";
import * as staff from "../controllers/staff.controller";
import { uploadImage } from "../controllers/uploads.controller";
import { getMenu } from "../controllers/menu.controller";
import { requireAuth, requireRole } from "../middleware/auth";
import { imageUpload } from "../middleware/upload";
import { asyncHandler } from "../middleware/asyncHandler";
import type { AuthRequest } from "../types";

const router = Router();
const ah = asyncHandler<AuthRequest>;

// ── Auth ──────────────────────────────────────────────────
router.post("/auth/login", asyncHandler(login));

// ── Super Admin (platform owner) ─────────────────────────
router.get(   "/super/stats",                requireAuth, requireRole("SUPERADMIN"), ah(getCompanyStats));
router.get(   "/super/companies",            requireAuth, requireRole("SUPERADMIN"), ah(listCompanies));
router.post(  "/super/companies",            requireAuth, requireRole("SUPERADMIN"), ah(createCompany));
router.patch( "/super/companies/:id/toggle", requireAuth, requireRole("SUPERADMIN"), ah(toggleCompany));
router.delete("/super/companies/:id",        requireAuth, requireRole("SUPERADMIN"), ah(deleteCompany));

// Tables & QR codes are provisioned by the platform owner, per company.
router.get(   "/super/companies/:companyId/tables",     requireAuth, requireRole("SUPERADMIN"), ah(tables.list));
router.post(  "/super/companies/:companyId/tables",     requireAuth, requireRole("SUPERADMIN"), ah(tables.create));
router.patch( "/super/companies/:companyId/tables/:id", requireAuth, requireRole("SUPERADMIN"), ah(tables.update));
router.delete("/super/companies/:companyId/tables/:id", requireAuth, requireRole("SUPERADMIN"), ah(tables.remove));

// ── Hotel Admin ───────────────────────────────────────────
router.get(   "/categories",     requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), ah(categories.list));
router.post(  "/categories",     requireAuth, requireRole("ADMIN"), ah(categories.create));
router.patch( "/categories/:id", requireAuth, requireRole("ADMIN"), ah(categories.update));
router.delete("/categories/:id", requireAuth, requireRole("ADMIN"), ah(categories.remove));

router.get(   "/menu-items",     requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), ah(menuItems.list));
router.post(  "/menu-items",     requireAuth, requireRole("ADMIN"), ah(menuItems.create));
router.patch( "/menu-items/:id", requireAuth, requireRole("ADMIN"), ah(menuItems.update));
router.delete("/menu-items/:id", requireAuth, requireRole("ADMIN"), ah(menuItems.remove));

router.get(   "/restaurant/settings",     requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), ah(restaurant.getSettings));
router.patch( "/restaurant/hero-images",  requireAuth, requireRole("ADMIN"), ah(restaurant.updateHeroImages));

router.get(   "/kitchen-staff",     requireAuth, requireRole("ADMIN"), ah(staff.listKitchenStaff));
router.post(  "/kitchen-staff",     requireAuth, requireRole("ADMIN"), ah(staff.createKitchenStaff));
router.patch( "/kitchen-staff/:id", requireAuth, requireRole("ADMIN"), ah(staff.updateKitchenStaff));
router.delete("/kitchen-staff/:id", requireAuth, requireRole("ADMIN"), ah(staff.removeKitchenStaff));

router.post(  "/uploads", requireAuth, requireRole("ADMIN"), imageUpload.single("file"), ah(uploadImage));

// ── Kitchen ───────────────────────────────────────────────
router.get(   "/orders",              requireAuth, requireRole("ADMIN", "KITCHEN", "SUPERADMIN"), ah(orders.listActive));
router.patch( "/orders/:id/status",   requireAuth, requireRole("ADMIN", "KITCHEN"), ah(orders.updateStatus));

// ── Customer (public) ─────────────────────────────────────
router.post("/orders", asyncHandler(orders.create));
router.get( "/menu/:token", asyncHandler(getMenu));

export default router;
