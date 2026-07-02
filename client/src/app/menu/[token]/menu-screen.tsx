import type { CategoryDTO, MenuItemDTO } from "@/lib/types";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { MenuItemCard } from "@/components/ui/MenuItemCard";
import { ChevronLeftIcon } from "@/components/ui/icons";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

export function MenuScreen({
  categories,
  activeCategory,
  onSelectCategory,
  query,
  todaySpecialOnly,
  onBackToMenu,
  visibleItems,
  cart,
  liked,
  onOpenItem,
  onToggleLike,
  onAddToCart,
  onDecrement,
}: {
  categories: CategoryDTO[];
  activeCategory: string;
  onSelectCategory: (id: string) => void;
  query: string;
  todaySpecialOnly: boolean;
  onBackToMenu: () => void;
  visibleItems: MenuItemDTO[];
  cart: Record<string, CartLine>;
  liked: Set<string>;
  onOpenItem: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onDecrement: (id: string) => void;
}) {
  return (
    <main>
      {!query.trim() && (
        <CategoryPills items={categories} activeId={activeCategory} onSelect={onSelectCategory} />
      )}

      <div className="px-4 pt-2">
        {todaySpecialOnly && (
          <div className="mb-3 flex items-center gap-2">
            <button onClick={onBackToMenu} className="flex items-center gap-1 text-xs font-semibold text-muted">
              <ChevronLeftIcon width={14} height={14} /> Back to menu
            </button>
          </div>
        )}

        {visibleItems.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted">No items found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 pb-4">
            {visibleItems.map((item) => (
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
      </div>
    </main>
  );
}
