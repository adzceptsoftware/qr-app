import type { Response } from "express";
import type { AuthRequest } from "../types";
import Restaurant from "../models/restaurant.model";

const MAX_HERO_IMAGES = 3;

export async function getSettings(req: AuthRequest, res: Response) {
  if (!req.user!.restaurantId) {
    res.json({ id: null, name: "Kitchen Display", address: undefined, phone: undefined, heroImages: [] });
    return;
  }
  const restaurant = await Restaurant.findById(req.user!.restaurantId);
  if (!restaurant) { res.status(404).json({ message: "Not found" }); return; }

  res.json({
    id: restaurant._id.toString(),
    name: restaurant.name,
    address: restaurant.address,
    phone: restaurant.phone,
    heroImages: restaurant.heroImages,
  });
}

export async function updateHeroImages(req: AuthRequest, res: Response) {
  const { heroImages } = req.body as { heroImages?: unknown };

  if (!Array.isArray(heroImages) || !heroImages.every((url) => typeof url === "string")) {
    res.status(400).json({ message: "heroImages must be an array of URLs" }); return;
  }
  const urls = heroImages.map((url) => url.trim()).filter(Boolean);
  if (urls.length > MAX_HERO_IMAGES) {
    res.status(400).json({ message: `Maximum ${MAX_HERO_IMAGES} images allowed` }); return;
  }

  const restaurant = await Restaurant.findByIdAndUpdate(
    req.user!.restaurantId,
    { heroImages: urls },
    { new: true }
  );
  if (!restaurant) { res.status(404).json({ message: "Not found" }); return; }

  res.json({ heroImages: restaurant.heroImages });
}
