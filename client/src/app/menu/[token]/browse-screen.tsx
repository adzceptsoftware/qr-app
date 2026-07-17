import type { CategoryDTO, MenuItemDTO, SubcategoryDTO } from "@/lib/types";
import { MenuItemCard } from "@/components/ui/MenuItemCard";
import { CategoryTabs } from "@/components/ui/CategoryTabs";
import { ChevronLeftIcon } from "@/components/ui/icons";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

type Handlers = {
  cart: Record<string, CartLine>;
  liked: Set<string>;
  onOpenItem: (id: string) => void;
  onToggleLike: (id: string) => void;
  onAddToCart: (item: { id: string; name: string; price: number }) => void;
  onDecrement: (id: string) => void;
};

function ItemGrid({ items, cart, liked, onOpenItem, onToggleLike, onAddToCart, onDecrement }: { items: MenuItemDTO[] } & Handlers) {
  if (items.length === 0) {
    return <p className="py-10 text-center text-sm text-muted">No items here yet.</p>;
  }
  return (
    <div className="grid grid-cols-2 gap-3">
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
  );
}

function SubcategoryCard({ sub, onClick }: { sub: SubcategoryDTO; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface text-left shadow-sm transition-colors active:bg-background"
    >
      <div className="h-24 w-full bg-background">
        {sub.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sub.imageUrl} alt={sub.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl opacity-30">🍽️</div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <p className="font-semibold text-foreground">{sub.name}</p>
        <p className="text-xs text-muted">
          {sub.menuItems.length} item{sub.menuItems.length === 1 ? "" : "s"}
        </p>
      </div>
    </button>
  );
}

export function BrowseScreen({
  categories,
  selectedCategoryId,
  selectedSubId,
  onSelectCategory,
  onSelectSub,
  ...handlers
}: {
  categories: CategoryDTO[];
  selectedCategoryId: string;
  selectedSubId: string | null;
  onSelectCategory: (id: string) => void;
  onSelectSub: (id: string | null) => void;
} & Handlers) {
  const cat = categories.find((c) => c.id === selectedCategoryId) ?? categories[0];
  const sub = cat?.subcategories.find((s) => s.id === selectedSubId) ?? null;

  if (!cat) {
    return <main className="px-4"><p className="py-12 text-center text-sm text-muted">No menu yet.</p></main>;
  }

  // Drilled into a subcategory — show only its items, nothing else.
  if (sub) {
    return (
      <main className="px-4">
        <button onClick={() => onSelectSub(null)} className="mb-3 flex items-center gap-1 text-xs font-semibold text-muted">
          <ChevronLeftIcon width={14} height={14} /> Back to {cat.name}
        </button>
        <h2 className="mb-3 text-base font-bold text-foreground">{sub.name}</h2>
        <ItemGrid items={sub.menuItems} {...handlers} />
      </main>
    );
  }

  return (
    <main className="px-4">
      <h2 className="mb-1 text-base font-bold text-foreground">Menu</h2>
      <CategoryTabs items={categories} activeId={cat.id} onSelect={onSelectCategory} />

      {cat.subcategories.length > 0 ? (
        <>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {cat.subcategories.map((s) => (
              <SubcategoryCard key={s.id} sub={s} onClick={() => onSelectSub(s.id)} />
            ))}
          </div>

          {cat.menuItems.length > 0 && (
            <section className="mt-6">
              <h3 className="mb-3 text-sm font-bold text-foreground">More in {cat.name}</h3>
              <ItemGrid items={cat.menuItems} {...handlers} />
            </section>
          )}
        </>
      ) : (
        <div className="mt-3">
          <ItemGrid items={cat.menuItems} {...handlers} />
        </div>
      )}
    </main>
  );
}
