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
import { Breadcrumb, type BreadcrumbSegment } from "@/components/ui/Breadcrumb";
import { HomeScreen } from "./home-screen";
import { MenuScreen } from "./menu-screen";
import { BrowseScreen } from "./browse-screen";
import { FavouritesScreen } from "./favourites-screen";
import { useOrderTracking, OrderTrackerScreen, OrderStatusBanner } from "./order-tracker";

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
  const [query, setQuery] = useState("");
  const [todaySpecialOnly, setTodaySpecialOnly] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id ?? "");
  const [selectedSubId, setSelectedSubId] = useState<string | null>(null);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trackedOrder = useOrderTracking(orderId);

  const [restored, setRestored] = useState(false);

  useEffect(() => {
    // Sync from storage after mount (unavailable during SSR).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLiked(loadFavourites(restaurant.id));

    const session = loadSession(tableToken);
    if (session.cart) setCart(session.cart);
    if (session.orderId !== undefined) setOrderId(session.orderId);
    if (session.trackerOpen !== undefined) setTrackerOpen(session.trackerOpen);
    if (session.nav) setNav(session.nav);
    setRestored(true);
  }, [restaurant.id, tableToken]);

  useEffect(() => {
    // Skip the first render so we don't overwrite storage with the pre-restore defaults.
    if (!restored) return;
    saveSession(tableToken, { cart, orderId, trackerOpen, nav });
  }, [tableToken, cart, orderId, trackerOpen, nav, restored]);

  // Flat union of every item across categories AND subcategories — powers search,
  // Today Special, favourites, cart and the item-detail sheet.
  const allItems = useMemo(
    () =>
      categories.flatMap((c) => [
        ...c.menuItems.map((item) => ({ ...item, categoryId: c.id })),
        ...c.subcategories.flatMap((s) => s.menuItems.map((item) => ({ ...item, categoryId: s.id }))),
      ]),
    [categories]
  );

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === selectedCategoryId) ?? categories[0] ?? null,
    [categories, selectedCategoryId]
  );
  const selectedSub = selectedCategory?.subcategories.find((s) => s.id === selectedSubId) ?? null;

  const visibleItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q) return allItems.filter((i) => i.name.toLowerCase().includes(q));
    if (todaySpecialOnly) return allItems.filter((i) => !!i.badge);
    return allItems;
  }, [allItems, query, todaySpecialOnly]);

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

  function goBrowseRoot() {
    setTodaySpecialOnly(false);
    setQuery("");
    setSelectedSubId(null);
  }

  function openMenu(specialOnly: boolean) {
    setTodaySpecialOnly(specialOnly);
    setQuery("");
    setSelectedSubId(null);
    setNav("menu");
  }

  function selectCategory(id: string) {
    setSelectedCategoryId(id);
    setSelectedSubId(null);
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
      setTrackerOpen(true);
      setCart({});
      setShowCart(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  const openItem: (MenuItemDTO & { categoryId: string }) | undefined =
    allItems.find((i) => i.id === openItemId);

  const isSearching = query.trim().length > 0;
  const isBrowsing = nav === "menu" && !isSearching && !todaySpecialOnly;

  const breadcrumbSegments: BreadcrumbSegment[] = [{ label: "Home", onClick: () => setNav("home") }];
  if (nav === "menu") {
    breadcrumbSegments.push({ label: "Menu", onClick: goBrowseRoot });
    if (isSearching) {
      breadcrumbSegments.push({ label: "Search" });
    } else if (todaySpecialOnly) {
      breadcrumbSegments.push({ label: "Today Special" });
    } else if (selectedCategory) {
      breadcrumbSegments.push({ label: selectedCategory.name, onClick: () => setSelectedSubId(null) });
      if (selectedSub) breadcrumbSegments.push({ label: selectedSub.name });
    }
  } else if (nav === "favourites") {
    breadcrumbSegments.push({ label: "Favourites" });
  }

  /* ── Order confirmed — live status ── */
  if (orderId && trackerOpen) {
    return (
      <OrderTrackerScreen
        orderId={orderId}
        order={trackedOrder}
        tableNumber={tableNumber}
        onOrderMore={() => setTrackerOpen(false)}
        onClose={() => {
          setTrackerOpen(false);
          setNav("home");
        }}
      />
    );
  }

  return (
    <div
      className="min-h-screen bg-background pb-24 text-foreground"
      style={{ fontFamily: "var(--font-fira), system-ui, sans-serif" }}
    >
      {/* ── Header ── */}
      <header className="px-4 pb-3 pt-6">
        <div className="flex items-start justify-between">
          <div>
            {restaurant.address && (
              <p className="text-[13px] font-semibold text-muted">{restaurant.address}</p>
            )}
            <h1 className="text-[28px] font-bold leading-tight tracking-tight text-foreground">
              {restaurant.name}
            </h1>
          </div>
          <RatingBadge value={DEFAULT_RATING} />
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

      <div className="px-4 pt-2 pb-5">
        <HeroCarousel images={restaurant.heroImages} fallbackLabel={restaurant.name} />
      </div>

      {nav !== "home" && (
        <div className="px-4 pb-4">
          <Breadcrumb segments={breadcrumbSegments} />
        </div>
      )}

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
        isBrowsing ? (
          <BrowseScreen
            categories={categories}
            selectedCategoryId={selectedCategory?.id ?? ""}
            selectedSubId={selectedSubId}
            onSelectCategory={selectCategory}
            onSelectSub={setSelectedSubId}
            cart={cart}
            liked={liked}
            onOpenItem={setOpenItemId}
            onToggleLike={toggleLike}
            onAddToCart={addToCart}
            onDecrement={decrement}
          />
        ) : (
          <MenuScreen
            heading={todaySpecialOnly ? "Today Special" : undefined}
            onBack={todaySpecialOnly ? goBrowseRoot : undefined}
            items={visibleItems}
            cart={cart}
            liked={liked}
            onOpenItem={setOpenItemId}
            onToggleLike={toggleLike}
            onAddToCart={addToCart}
            onDecrement={decrement}
          />
        )
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
      {!showCart && (
        <FloatingCartButton itemCount={itemCount} onClick={() => setShowCart(true)} raised={!!orderId} />
      )}
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

      {/* ── Developer credit ── */}
      <footer className="mt-10 px-4 text-center">
        <p className="text-[11px] text-muted">
          Developed by{" "}
          <a href="https://digihack.lk" target="_blank" rel="noreferrer" className="font-semibold text-foreground">
            DigiHack
          </a>
        </p>
        <p className="mt-0.5 text-[11px] text-muted">
          <a href="tel:+94760142500">076 014 2500</a>
          {" · "}
          <a href="mailto:digihacklk@gmail.com">digihacklk@gmail.com</a>
        </p>
      </footer>

      {/* ── Live status of the order placed earlier this session ── */}
      {orderId && !showCart && (
        <OrderStatusBanner
          order={trackedOrder}
          onDismiss={() => setOrderId(null)}
        />
      )}

      <BottomNav active={nav} onChange={setNav} />
    </div>
  );
}
