export type MenuItemDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  badge?: string | null;
};

export type SubcategoryDTO = {
  id: string;
  name: string;
  imageUrl?: string | null;
  menuItems: MenuItemDTO[];
};

export type CategoryDTO = {
  id: string;
  name: string;
  imageUrl?: string | null;
  menuItems: MenuItemDTO[];
  subcategories: SubcategoryDTO[];
};

export type RestaurantDTO = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  heroImages: string[];
};
