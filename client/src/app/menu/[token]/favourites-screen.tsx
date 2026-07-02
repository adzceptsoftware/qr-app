import type { MenuItemDTO } from "@/lib/types";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

export function FavouritesScreen({
  allItems,
  liked,
  cart,
  onAddToCart,
  onDecrement,
}: {
  allItems: MenuItemDTO[];
  liked: Set<string>;
  cart: Record<string, CartLine>;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onDecrement: (id: string) => void;
}) {
  const favourites = allItems.filter((i) => liked.has(i.id));

  return (
    <main className="px-4">
      <h2 className="mb-3 text-sm font-bold text-foreground">My Favourite</h2>
      {favourites.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No favourites yet — tap the heart on any item.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {favourites.map((item) => (
            <li key={item.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-2.5 shadow-sm">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-background">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-lg opacity-30">🍽️</div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{item.name}</p>
                <p className="text-sm font-bold text-accent">Rs {item.price.toFixed(2)}</p>
              </div>
              {(cart[item.id]?.qty ?? 0) === 0 ? (
                <button
                  onClick={() => onAddToCart(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
                >
                  +
                </button>
              ) : (
                <QuantityStepper
                  size="sm"
                  qty={cart[item.id]?.qty ?? 0}
                  onIncrement={() => onAddToCart(item)}
                  onDecrement={() => onDecrement(item.id)}
                />
              )}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
