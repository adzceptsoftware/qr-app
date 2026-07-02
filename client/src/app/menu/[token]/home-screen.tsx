import type { MenuItemDTO } from "@/lib/types";
import { MenuItemCard } from "@/components/ui/MenuItemCard";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

export function HomeScreen({
  allItems,
  cart,
  liked,
  onOpenMenu,
  onOpenItem,
  onToggleLike,
  onAddToCart,
  onDecrement,
}: {
  allItems: MenuItemDTO[];
  cart: Record<string, CartLine>;
  liked: Set<string>;
  onOpenMenu: (specialOnly: boolean) => void;
  onOpenItem: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onDecrement: (id: string) => void;
}) {
  return (
    <main className="px-4">
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onOpenMenu(false)}
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface py-7 text-base font-semibold text-foreground shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/menu.svg" alt="" width={36} height={36} />
          Menu
        </button>
        <button
          onClick={() => onOpenMenu(true)}
          className="flex flex-col items-center gap-2.5 rounded-2xl border border-border bg-surface py-7 text-base font-semibold text-foreground shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/icons/today-special.svg" alt="" width={36} height={36} />
          Today Special
        </button>
      </div>

      {allItems.some((i) => i.badge) && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">Today Special</h2>
            <button onClick={() => onOpenMenu(true)} className="text-xs font-semibold text-accent">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {allItems
              .filter((i) => i.badge)
              .slice(0, 4)
              .map((item) => (
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
        </section>
      )}
    </main>
  );
}
