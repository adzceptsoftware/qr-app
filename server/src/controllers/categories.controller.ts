import type { Response } from "express";
import type { Types } from "mongoose";
import type { AuthRequest } from "../types";
import Category from "../models/category.model";
import MenuItem from "../models/menu-item.model";

export async function list(req: AuthRequest, res: Response) {
  const categories = await Category.find({ restaurantId: req.user!.restaurantId }).sort({ position: 1 });
  const counts = await MenuItem.aggregate([
    { $match: { categoryId: { $in: categories.map((c) => c._id) } } },
    { $group: { _id: "$categoryId", count: { $sum: 1 } } },
  ]);
  const directCountMap = new Map(counts.map((c) => [c._id.toString(), c.count as number]));

  // Roll subcategory item counts up into their parent so a top-level category whose
  // items all live inside a subcategory doesn't misleadingly show "0 items".
  const rolledUpCountMap = new Map(directCountMap);
  for (const c of categories) {
    if (!c.parentId) continue;
    const parentKey = c.parentId.toString();
    const childDirect = directCountMap.get(c._id.toString()) ?? 0;
    if (childDirect === 0) continue;
    rolledUpCountMap.set(parentKey, (rolledUpCountMap.get(parentKey) ?? 0) + childDirect);
  }

  res.json(categories.map((c) => ({
    id: c._id.toString(), name: c.name, position: c.position, imageUrl: c.imageUrl ?? null,
    parentId: c.parentId ? c.parentId.toString() : null,
    itemCount: rolledUpCountMap.get(c._id.toString()) ?? 0,
  })));
}

/**
 * Validates a requested parentId for a category and returns the resolved ObjectId
 * (or undefined for top-level). Writes a response and returns null on error.
 */
async function resolveParent(
  req: AuthRequest,
  res: Response,
  parentId: string | null | undefined,
): Promise<{ ok: true; value?: Types.ObjectId } | { ok: false }> {
  if (parentId === undefined) return { ok: true, value: undefined };
  if (parentId === null || parentId === "") return { ok: true, value: undefined };

  const parent = await Category.findOne({ _id: parentId, restaurantId: req.user!.restaurantId });
  if (!parent) { res.status(400).json({ message: "Parent category not found" }); return { ok: false }; }
  if (parent.parentId) { res.status(400).json({ message: "Categories can only be nested one level deep" }); return { ok: false }; }
  return { ok: true, value: parent._id as Types.ObjectId };
}

export async function create(req: AuthRequest, res: Response) {
  const { name, imageUrl, parentId } = req.body as { name?: string; imageUrl?: string; parentId?: string | null };
  if (!name?.trim()) { res.status(400).json({ message: "Name required" }); return; }

  const parent = await resolveParent(req, res, parentId);
  if (!parent.ok) return;

  // Top-level categories render as tabs, not cards — only subcategories carry an image.
  const finalImageUrl = parent.value ? imageUrl?.trim() || undefined : undefined;

  const count = await Category.countDocuments({ restaurantId: req.user!.restaurantId });
  const category = await Category.create({
    name: name.trim(), imageUrl: finalImageUrl,
    position: count, parentId: parent.value, restaurantId: req.user!.restaurantId,
  });
  res.status(201).json({ id: category._id.toString(), name: category.name });
}

export async function update(req: AuthRequest, res: Response) {
  const { name, imageUrl, parentId } = req.body as { name?: string; imageUrl?: string; parentId?: string | null };

  const category = await Category.findOne({ _id: req.params.id, restaurantId: req.user!.restaurantId });
  if (!category) { res.status(404).json({ message: "Not found" }); return; }

  if (name !== undefined) {
    if (!name.trim()) { res.status(400).json({ message: "Name required" }); return; }
    category.name = name.trim();
  }

  if (parentId !== undefined) {
    const parent = await resolveParent(req, res, parentId);
    if (!parent.ok) return;
    // A category that already has subcategories cannot itself become a subcategory.
    if (parent.value && (await Category.exists({ parentId: category._id }))) {
      res.status(400).json({ message: "This category has subcategories and cannot be nested" });
      return;
    }
    category.parentId = parent.value;
  }

  // Top-level categories render as tabs, not cards — only subcategories carry an image.
  if (!category.parentId) {
    category.imageUrl = undefined;
  } else if (imageUrl !== undefined) {
    category.imageUrl = imageUrl.trim() || undefined;
  }

  await category.save();
  res.json({ id: category._id.toString(), name: category.name });
}

export async function remove(req: AuthRequest, res: Response) {
  // Cascade: deleting a top-level category also removes its subcategories.
  await Category.deleteMany({ parentId: req.params.id, restaurantId: req.user!.restaurantId });
  await Category.deleteOne({ _id: req.params.id, restaurantId: req.user!.restaurantId });
  res.json({ message: "Deleted" });
}
