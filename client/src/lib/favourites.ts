function storageKey(restaurantId: string) {
  return `qr-app:favourites:${restaurantId}`;
}

export function loadFavourites(restaurantId: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(storageKey(restaurantId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

export function saveFavourites(restaurantId: string, favourites: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(storageKey(restaurantId), JSON.stringify([...favourites]));
}
