import type { MenuItemDTO } from "@/lib/types";
import { MenuItemCard } from "@/components/ui/MenuItemCard";
import { ChevronLeftIcon } from "@/components/ui/icons";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

/** Flat results grid used for search and Today Special (spans categories + subcategories). */
export function MenuScreen({
  heading,
  onBack,
  items,
  cart,
  liked,
  onOpenItem,
  onToggleLike,
  onAddToCart,
  onDecrement,
}: {
  heading?: string;
  onBack?: () => void;
  items: MenuItemDTO[];
  cart: Record<string, CartLine>;
  liked: Set<string>;
  onOpenItem: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onDecrement: (id: string) => void;
}) {
  return (
    <main className="px-4 pt-2">
      {(heading || onBack) && (
        <div className="mb-3 flex items-center gap-2">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-1 text-xs font-semibold text-muted">
              <ChevronLeftIcon width={14} height={14} /> Back to menu
            </button>
          )}
          {heading && <h2 className="text-sm font-bold text-foreground">{heading}</h2>}
        </div>
      )}

      {items.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No items found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 pb-4">
          {items.map((item) => (
            <MenuItemCard
              key={item.id}
              name={item.name}
              description={item.description}
              price={item.price}
              imageUrl={item.imageUrl}
              qty={cart[item.id]?.qty ?? 0}
              liked={liked.has(item.id)}
              onOpen={() => onOpenItem(item.id)}
              onToggleLike={() => onToggleLike(item.id)}
              onIncrement={() => onAddToCart(item)}
              onDecrement={() => onDecrement(item.id)}
            />
          ))}
        </div>
      )}
    </main>
  );
}
