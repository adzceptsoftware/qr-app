"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryDTO, MenuItemDTO, RestaurantDTO } from "@/lib/types";
import { loadFavourites, saveFavourites } from "@/lib/favourites";
import { BottomNav, type NavKey } from "@/components/ui/BottomNav";
import { SearchBar } from "@/components/ui/SearchBar";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { CategoryPills } from "@/components/ui/CategoryPills";
import { MenuItemCard } from "@/components/ui/MenuItemCard";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { ItemDetailSheet } from "@/components/ui/ItemDetailSheet";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";
import { CartSheet } from "@/components/ui/CartSheet";
import { Button } from "@/components/ui/Button";
import { ChevronLeftIcon, HeartIcon, StarIcon } from "@/components/ui/icons";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

// Placeholder until the Restaurant model gains a real rating field.
const DEFAULT_RATING = 4.8;

export function MenuClient({
  restaurant,
  categories,
  tableToken,
  tableNumber,
}: {
  restaurant: RestaurantDTO;
  categories: CategoryDTO[];
  tableToken: string;
  tableNumber: string;
}) {
  const [nav, setNav] = useState<NavKey>("home");
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [todaySpecialOnly, setTodaySpecialOnly] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Sync from localStorage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(loadFavourites(restaurant.id));
  }, [restaurant.id]);

  const allItems = useMemo(
    () => categories.flatMap((c) => c.menuItems.map((item) => ({ ...item, categoryId: c.id, categoryIcon: c.icon }))),
    [categories]
  );

  const activeCategoryData = categories.find((c) => c.id === activeCategory) ?? categories[0];

  const visibleItems = useMemo(() => {
    let items = query.trim() ? allItems : activeCategoryData?.menuItems ?? [];
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (todaySpecialOnly) {
      items = items.filter((i) => !!i.badge);
    }
    return items;
  }, [query, allItems, activeCategoryData, todaySpecialOnly]);

  const lines = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  function addToCart(item: { id: string; name: string; price: number }) {
    setCart((prev) => ({
      ...prev,
      [item.id]: { menuItemId: item.id, name: item.name, price: item.price, qty: (prev[item.id]?.qty ?? 0) + 1 },
    }));
  }

  function decrement(menuItemId: string) {
    setCart((prev) => {
      if (!prev[menuItemId]) return prev;
      if (prev[menuItemId].qty <= 1) {
        const next = { ...prev };
        delete next[menuItemId];
        return next;
      }
      return { ...prev, [menuItemId]: { ...prev[menuItemId], qty: prev[menuItemId].qty - 1 } };
    });
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFavourites(restaurant.id, next);
      return next;
    });
  }

  function openMenu(specialOnly: boolean) {
    setTodaySpecialOnly(specialOnly);
    setQuery("");
    setNav("menu");
  }

  async function placeOrder() {
    setPlacing(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableToken,
          items: lines.map((l) => ({ menuItemId: l.menuItemId, qty: l.qty })),
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(data.error ?? "Could not place order");
      }
      const data = (await res.json()) as { id: string };
      setOrderId(data.id);
      setCart({});
      setShowCart(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  const openItem: (MenuItemDTO & { categoryId: string; categoryIcon?: string | null }) | undefined =
    allItems.find((i) => i.id === openItemId);

  /* ── Order success ── */
  if (orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
        <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-2xl text-accent-foreground">
          ✓
        </div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">Order confirmed</p>
        <h1 className="mb-3 text-2xl font-bold text-foreground">Thank you!</h1>
        <p className="mb-6 max-w-xs text-sm text-muted">
          Your order is on its way to <span className="font-semibold text-foreground">Table {tableNumber}</span>.
        </p>
        <div className="mb-8 rounded-2xl border border-border bg-surface px-8 py-4">
          <p className="text-xs text-muted">Order reference</p>
          <p className="mt-1 font-mono text-xl font-bold text-foreground">#{orderId.slice(-8).toUpperCase()}</p>
        </div>
        <Button onClick={() => setOrderId(null)}>Order more</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      {/* ── Header ── */}
      <header className="px-4 pb-3 pt-6">
        <div className="flex items-start justify-between">
          <div>
            {restaurant.address && (
              <p className="text-xs text-muted">{restaurant.address}</p>
            )}
            <h1 className="text-xl font-bold text-foreground">{restaurant.name}</h1>
          </div>
          <div className="flex items-center gap-2">
            <RatingBadge value={DEFAULT_RATING} />
            <button className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface">
              <HeartIcon width={14} height={14} className="text-muted" />
            </button>
          </div>
        </div>

        <div className="mt-3">
          <SearchBar
            value={query}
            onChange={(v) => {
              setQuery(v);
              setTodaySpecialOnly(false);
              if (v.trim() && nav === "home") setNav("menu");
            }}
          />
        </div>
      </header>

      {/* ── Home ── */}
      {nav === "home" && (
        <main className="px-4">
          <HeroCarousel images={[]} fallbackLabel={restaurant.name} />

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => openMenu(false)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-5 text-sm font-semibold text-foreground shadow-sm"
            >
              <span className="text-2xl">📋</span>
              Menu
            </button>
            <button
              onClick={() => openMenu(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface py-5 text-sm font-semibold text-foreground shadow-sm"
            >
              <StarIcon width={22} height={22} className="text-accent" />
              Today Special
            </button>
          </div>

          {allItems.some((i) => i.badge) && (
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-bold text-foreground">Today Special</h2>
                <button onClick={() => openMenu(true)} className="text-xs font-semibold text-accent">
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
                      onOpen={() => setOpenItemId(item.id)}
                      onToggleLike={() => toggleLike(item.id)}
                      onIncrement={() => addToCart(item)}
                      onDecrement={() => decrement(item.id)}
                    />
                  ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* ── Menu ── */}
      {nav === "menu" && (
        <main>
          {!query.trim() && (
            <CategoryPills items={categories} activeId={activeCategory} onSelect={(id) => { setActiveCategory(id); setTodaySpecialOnly(false); }} />
          )}

          <div className="px-4 pt-2">
            {todaySpecialOnly && (
              <div className="mb-3 flex items-center gap-2">
                <button onClick={() => setTodaySpecialOnly(false)} className="flex items-center gap-1 text-xs font-semibold text-muted">
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
                    onOpen={() => setOpenItemId(item.id)}
                    onToggleLike={() => toggleLike(item.id)}
                    onIncrement={() => addToCart(item)}
                    onDecrement={() => decrement(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      )}

      {/* ── Favourites ── */}
      {nav === "favourites" && (
        <main className="px-4">
          <h2 className="mb-3 text-sm font-bold text-foreground">My Favourite</h2>
          {allItems.filter((i) => liked.has(i.id)).length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">No favourites yet — tap the heart on any item.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {allItems
                .filter((i) => liked.has(i.id))
                .map((item) => (
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
                        onClick={() => addToCart(item)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground"
                      >
                        +
                      </button>
                    ) : (
                      <QuantityStepper
                        size="sm"
                        qty={cart[item.id]?.qty ?? 0}
                        onIncrement={() => addToCart(item)}
                        onDecrement={() => decrement(item.id)}
                      />
                    )}
                  </li>
                ))}
            </ul>
          )}
        </main>
      )}

      {/* ── Orders ── */}
      {nav === "orders" && (
        <main className="flex flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-sm text-muted">No orders yet this visit.</p>
          <p className="mt-1 text-xs text-muted">Orders you place will show up here.</p>
        </main>
      )}

      {/* ── Item detail ── */}
      {openItem && (
        <ItemDetailSheet
          name={openItem.name}
          description={openItem.description}
          price={openItem.price}
          imageUrl={openItem.imageUrl}
          qty={cart[openItem.id]?.qty ?? 0}
          liked={liked.has(openItem.id)}
          onClose={() => setOpenItemId(null)}
          onToggleLike={() => toggleLike(openItem.id)}
          onIncrement={() => addToCart(openItem)}
          onDecrement={() => decrement(openItem.id)}
          onAddToOrder={() => {
            if ((cart[openItem.id]?.qty ?? 0) === 0) addToCart(openItem);
            setOpenItemId(null);
          }}
        />
      )}

      {/* ── Cart ── */}
      {!showCart && <FloatingCartButton itemCount={itemCount} onClick={() => setShowCart(true)} />}
      {showCart && (
        <CartSheet
          lines={lines}
          total={total}
          placing={placing}
          error={error}
          onClose={() => setShowCart(false)}
          onIncrement={(id) => {
            const line = lines.find((l) => l.menuItemId === id);
            if (line) addToCart({ id: line.menuItemId, name: line.name, price: line.price });
          }}
          onDecrement={decrement}
          onPlaceOrder={placeOrder}
        />
      )}

      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
}
