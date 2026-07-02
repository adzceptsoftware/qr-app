export type MenuItemDTO = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  available: boolean;
  badge?: string | null;
};

export type CategoryDTO = {
  id: string;
  name: string;
  icon?: string | null;
  menuItems: MenuItemDTO[];
};

export type RestaurantDTO = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  heroImages: string[];
};
