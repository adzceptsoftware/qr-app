"use client";

import { useEffect, useMemo, useState } from "react";
import type { CategoryDTO, MenuItemDTO, RestaurantDTO } from "@/lib/types";
import { loadFavourites, saveFavourites } from "@/lib/favourites";
import { loadSession, saveSession } from "@/lib/cart-session";
import { BottomNav, type NavKey } from "@/components/ui/BottomNav";
import { SearchBar } from "@/components/ui/SearchBar";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { RatingBadge } from "@/components/ui/RatingBadge";
import { ItemDetailSheet } from "@/components/ui/ItemDetailSheet";
import { FloatingCartButton } from "@/components/ui/FloatingCartButton";
import { CartSheet } from "@/components/ui/CartSheet";
import { Button } from "@/components/ui/Button";
import { HeartIcon } from "@/components/ui/icons";
import { Breadcrumb, type BreadcrumbSegment } from "@/components/ui/Breadcrumb";
import { HomeScreen } from "./home-screen";
import { MenuScreen } from "./menu-screen";
import { FavouritesScreen } from "./favourites-screen";

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

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    // Sync from storage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(loadFavourites(restaurant.id));

    const session = loadSession(tableToken);
    if (session.cart) setCart(session.cart);
    if (session.orderId !== undefined) setOrderId(session.orderId);
    if (session.nav) setNav(session.nav);
    setRestored(true);
  }, [restaurant.id, tableToken]);

  useEffect(() => {
    // Skip the first render so we don't overwrite storage with the pre-restore defaults.
    if (!restored) return;
    saveSession(tableToken, { cart, orderId, nav });
  }, [tableToken, cart, orderId, nav, restored]);

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

  const breadcrumbSegments: BreadcrumbSegment[] = [{ label: "Home", onClick: () => setNav("home") }];
  if (nav === "menu") {
    breadcrumbSegments.push({ label: "Menu", onClick: () => setTodaySpecialOnly(false) });
    if (query.trim()) {
      breadcrumbSegments.push({ label: "Search" });
    } else if (todaySpecialOnly) {
      breadcrumbSegments.push({ label: "Today Special" });
    } else if (activeCategoryData) {
      breadcrumbSegments.push({ label: activeCategoryData.name });
    }
  } else if (nav === "favourites") {
    breadcrumbSegments.push({ label: "Favourites" });
  }

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

      <div className="px-4 pb-3">
        <HeroCarousel images={restaurant.heroImages} fallbackLabel={restaurant.name} />
      </div>

      <div className="px-4 pb-4">
        <Breadcrumb segments={breadcrumbSegments} />
      </div>

      {nav === "home" && (
        <HomeScreen
          allItems={allItems}
          cart={cart}
          liked={liked}
          onOpenMenu={openMenu}
          onOpenItem={setOpenItemId}
          onToggleLike={toggleLike}
          onAddToCart={addToCart}
          onDecrement={decrement}
        />
      )}

      {nav === "menu" && (
        <MenuScreen
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={(id) => { setActiveCategory(id); setTodaySpecialOnly(false); }}
          query={query}
          todaySpecialOnly={todaySpecialOnly}
          onBackToMenu={() => setTodaySpecialOnly(false)}
          visibleItems={visibleItems}
          cart={cart}
          liked={liked}
          onOpenItem={setOpenItemId}
          onToggleLike={toggleLike}
          onAddToCart={addToCart}
          onDecrement={decrement}
        />
      )}

      {nav === "favourites" && (
        <FavouritesScreen
          allItems={allItems}
          liked={liked}
          cart={cart}
          onAddToCart={addToCart}
          onDecrement={decrement}
        />
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
