"use client";

import { useMemo, useRef, useState } from "react";
import type { CategoryDTO, RestaurantDTO } from "@/lib/types";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

const GOLD = "#c8a84b";

const CINZEL   = "var(--font-cinzel), 'Trajan Pro', serif";
const PLAYFAIR = "var(--font-playfair), Georgia, serif";
const INTER    = "var(--font-inter), system-ui, sans-serif";
const POPPINS  = "var(--font-poppins), system-ui, sans-serif";

const BADGE_STYLES: Record<string, string> = {
  "Chef's Pick": "bg-amber-500 text-black",
  "Signature":   "bg-purple-600 text-white",
  "Popular":     "bg-blue-500 text-white",
  "New":         "bg-emerald-500 text-white",
  "Must Try":    "bg-rose-500 text-white",
  "Spicy":       "bg-red-500 text-white",
  "Vegan":       "bg-green-600 text-white",
  "Premium":     "bg-yellow-500 text-black",
};

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
  const [cart, setCart] = useState<Record<string, CartLine>>({});
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id ?? "");
  const [placing, setPlacing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const navRef = useRef<HTMLDivElement>(null);

  const lines = useMemo(() => Object.values(cart), [cart]);
  const total = useMemo(() => lines.reduce((s, l) => s + l.price * l.qty, 0), [lines]);
  const itemCount = useMemo(() => lines.reduce((n, l) => n + l.qty, 0), [lines]);

  function addToCart(menuItemId: string, name: string, price: number) {
    setCart((prev) => ({
      ...prev,
      [menuItemId]: { menuItemId, name, price, qty: (prev[menuItemId]?.qty ?? 0) + 1 },
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
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function scrollToCategory(id: string) {
    setActiveCategory(id);
    sectionRefs.current[id]?.scrollIntoView({ behavior: "smooth", block: "start" });
    navRef.current?.querySelector(`[data-cat="${id}"]`)
      ?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
        const data = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(data.error ?? "Could not place order");
      }
      const data = await res.json() as { id: string };
      setOrderId(data.id);
      setCart({});
      setShowCart(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  }

  /* ── Order success ── */
  if (orderId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-black px-6 text-center">
        <div className="mb-6 text-5xl" style={{ color: GOLD }}>✦</div>
        <p className="mb-2 text-xs font-semibold tracking-[0.3em] uppercase" style={{ color: GOLD, fontFamily: CINZEL }}>
          Order Confirmed
        </p>
        <h1 className="mb-3 text-3xl font-bold text-white" style={{ fontFamily: CINZEL, letterSpacing: "4px" }}>
          Thank You!
        </h1>
        <p className="mb-6 text-sm text-gray-400" style={{ fontFamily: INTER }}>
          Your order is on its way to{" "}
          <span className="font-semibold text-white">Table {tableNumber}</span>.
        </p>
        <div className="mb-8 rounded-lg border px-8 py-4" style={{ borderColor: `${GOLD}40` }}>
          <p className="text-xs text-gray-500" style={{ fontFamily: INTER }}>Order Reference</p>
          <p className="mt-1 font-mono text-xl font-bold text-white">#{orderId.slice(-8).toUpperCase()}</p>
        </div>
        <button
          onClick={() => setOrderId(null)}
          className="rounded px-8 py-3 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          style={{ backgroundColor: GOLD, fontFamily: POPPINS }}
        >
          Order More
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ── Hero header ── */}
      <header className="relative border-b px-4 pb-8 pt-10 text-center" style={{ borderColor: `${GOLD}25` }}>
        {/* Table badge */}
        <div
          className="absolute right-4 top-4 rounded px-3 py-1.5 text-[10px] font-semibold tracking-[0.2em] uppercase"
          style={{ border: `1px solid ${GOLD}`, color: GOLD, fontFamily: POPPINS }}
        >
          Table {tableNumber}
        </div>

        {/* Crown */}
        <div className="mb-3 text-4xl" style={{ color: GOLD }}>♛</div>

        {/* Restaurant name — Cinzel */}
        <h1
          className="text-3xl font-semibold uppercase text-white sm:text-4xl"
          style={{ fontFamily: CINZEL, letterSpacing: "8px" }}
        >
          {restaurant.name}
        </h1>

        {/* Tagline / address — Poppins small caps style */}
        {restaurant.address && (
          <p
            className="mt-2 text-[11px] uppercase tracking-[0.3em] text-gray-500"
            style={{ fontFamily: POPPINS }}
          >
            {restaurant.address}
          </p>
        )}
        {restaurant.phone && (
          <p className="text-[11px] text-gray-600" style={{ fontFamily: INTER }}>{restaurant.phone}</p>
        )}

        {/* Decorative MENU divider — Cinzel */}
        <div className="mx-auto mt-6 flex max-w-xs items-center gap-3">
          <div className="h-px flex-1" style={{ backgroundColor: `${GOLD}60` }} />
          <span
            className="text-base font-medium tracking-[0.5em] uppercase"
            style={{ fontFamily: CINZEL, color: GOLD }}
          >
            Menu
          </span>
          <div className="h-px flex-1" style={{ backgroundColor: `${GOLD}60` }} />
        </div>
      </header>

      {/* ── Category nav ── */}
      <div
        className="sticky top-0 z-20 border-b bg-black/98 backdrop-blur-md"
        style={{ borderColor: `${GOLD}20` }}
      >
        <div className="mx-auto max-w-5xl">
          <div ref={navRef} className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-cat={cat.id}
                onClick={() => scrollToCategory(cat.id)}
                className="flex shrink-0 items-center gap-1.5 rounded px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all"
                style={
                  activeCategory === cat.id
                    ? { backgroundColor: GOLD, color: "#000", fontFamily: POPPINS }
                    : { border: `1px solid ${GOLD}40`, color: "#a0a0a0", fontFamily: POPPINS }
                }
              >
                {cat.icon && <span>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Menu sections ── */}
      <main className="mx-auto max-w-5xl px-4 pb-36 pt-2">
        {categories.map((category) => (
          <section
            key={category.id}
            ref={(el) => { sectionRefs.current[category.id] = el; }}
            className="pt-10"
          >
            {/* Section header — Cinzel */}
            <div className="mb-6 flex items-center gap-4">
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, transparent, ${GOLD}50)` }} />
              <span
                className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.3em]"
                style={{ color: GOLD, fontFamily: CINZEL }}
              >
                {category.icon && <span>{category.icon}</span>}
                {category.name}
              </span>
              <div className="h-px flex-1" style={{ background: `linear-gradient(to left, transparent, ${GOLD}50)` }} />
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
              {category.menuItems.map((item) => {
                const qty = cart[item.id]?.qty ?? 0;
                const isLiked = liked.has(item.id);
                return (
                  <div
                    key={item.id}
                    className="flex flex-col overflow-hidden rounded-xl bg-[#0a0a0a]"
                    style={{ border: `1px solid ${GOLD}25` }}
                  >
                    {/* Image */}
                    <div className="relative h-40 shrink-0 overflow-hidden bg-[#111] sm:h-44">
                      {item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-4xl opacity-30">
                          {category.icon ?? "🍽️"}
                        </div>
                      )}

                      {item.badge && (
                        <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold ${BADGE_STYLES[item.badge] ?? "bg-gray-700 text-white"}`}
                          style={{ fontFamily: POPPINS }}>
                          {item.badge}
                        </span>
                      )}

                      <button
                        onClick={() => toggleLike(item.id)}
                        className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-sm backdrop-blur-sm transition-transform active:scale-90"
                        style={{ color: isLiked ? "#e53e3e" : "#ffffff80" }}
                      >
                        {isLiked ? "♥" : "♡"}
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-3">
                      {/* Item name — Playfair */}
                      <h3
                        className="text-sm font-bold leading-snug text-white sm:text-base"
                        style={{ fontFamily: PLAYFAIR }}
                      >
                        {item.name}
                      </h3>
                      {/* Description — Inter */}
                      {item.description && (
                        <p
                          className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-gray-500"
                          style={{ fontFamily: INTER }}
                        >
                          {item.description}
                        </p>
                      )}

                      {/* Price — Poppins SemiBold + button */}
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span
                          className="text-base font-semibold sm:text-lg"
                          style={{ color: GOLD, fontFamily: POPPINS }}
                        >
                          ${item.price.toFixed(2)}
                        </span>

                        {qty === 0 ? (
                          <button
                            onClick={() => addToCart(item.id, item.name, item.price)}
                            className="shrink-0 rounded px-3 py-1.5 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 active:scale-95"
                            style={{ backgroundColor: "#6b4a10", fontFamily: POPPINS }}
                          >
                            + Add
                          </button>
                        ) : (
                          <div
                            className="flex items-center rounded px-1 py-0.5"
                            style={{ border: `1px solid ${GOLD}40` }}
                          >
                            <button
                              onClick={() => decrement(item.id)}
                              className="flex h-6 w-6 items-center justify-center text-sm font-bold transition-colors hover:text-white"
                              style={{ color: GOLD }}
                            >−</button>
                            <span className="w-5 text-center text-sm font-bold text-white">{qty}</span>
                            <button
                              onClick={() => addToCart(item.id, item.name, item.price)}
                              className="flex h-6 w-6 items-center justify-center text-sm font-bold transition-colors hover:text-white"
                              style={{ color: GOLD }}
                            >+</button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        {/* Footer */}
        <div
          className="mt-16 flex flex-wrap justify-center gap-6 border-t pt-8 text-center text-xs text-gray-600"
          style={{ borderColor: `${GOLD}20`, fontFamily: INTER }}
        >
          <span>✦ All prices include taxes</span>
          <span>✦ Fresh & quality ingredients</span>
          <span>✦ Dietary options available</span>
          <span>✦ Ask staff for allergen info</span>
        </div>
      </main>

      {/* ── Cart ── */}
      {itemCount > 0 && (
        <>
          {showCart && (
            <div
              className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
              onClick={() => setShowCart(false)}
            />
          )}

          {showCart && (
            <div className="fixed inset-x-0 bottom-0 z-50 flex justify-center">
              <div
                className="w-full max-w-5xl rounded-t-2xl bg-[#0a0a0a] px-5 pb-8 pt-5"
                style={{ border: `1px solid ${GOLD}30`, borderBottom: "none" }}
              >
                <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: `${GOLD}40` }} />
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white" style={{ fontFamily: CINZEL, letterSpacing: "3px" }}>
                    Your Order
                  </h3>
                  <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-white">✕</button>
                </div>

                <ul className="mb-4 max-h-56 divide-y overflow-y-auto" style={{ borderColor: `${GOLD}15` }}>
                  {lines.map((l) => (
                    <li key={l.menuItemId} className="flex items-center justify-between py-3" style={{ borderColor: `${GOLD}15` }}>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decrement(l.menuItemId)}
                            className="flex h-6 w-6 items-center justify-center rounded text-xs"
                            style={{ border: `1px solid ${GOLD}40`, color: GOLD }}
                          >−</button>
                          <span className="w-5 text-center text-sm font-bold" style={{ color: GOLD }}>{l.qty}</span>
                          <button
                            onClick={() => addToCart(l.menuItemId, l.name, l.price)}
                            className="flex h-6 w-6 items-center justify-center rounded text-xs"
                            style={{ backgroundColor: GOLD, color: "#000" }}
                          >+</button>
                        </div>
                        <span className="text-sm text-gray-200" style={{ fontFamily: PLAYFAIR }}>{l.name}</span>
                      </div>
                      <span className="text-sm font-semibold" style={{ color: GOLD, fontFamily: POPPINS }}>
                        ${(l.price * l.qty).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mb-4 flex items-center justify-between border-t pt-4" style={{ borderColor: `${GOLD}20` }}>
                  <span className="text-sm text-gray-500" style={{ fontFamily: INTER }}>Total</span>
                  <span className="text-2xl font-semibold" style={{ color: GOLD, fontFamily: CINZEL, letterSpacing: "2px" }}>
                    ${total.toFixed(2)}
                  </span>
                </div>

                {error && (
                  <p className="mb-3 rounded px-3 py-2 text-xs text-red-400" style={{ backgroundColor: "#ff000015", fontFamily: INTER }}>
                    {error}
                  </p>
                )}

                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="w-full rounded py-4 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: GOLD, fontFamily: POPPINS, letterSpacing: "1px" }}
                >
                  {placing ? "Placing Order…" : `Confirm Order · $${total.toFixed(2)}`}
                </button>
              </div>
            </div>
          )}

          {!showCart && (
            <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-4 pb-5">
              <button
                onClick={() => setShowCart(true)}
                className="flex w-full max-w-5xl items-center justify-between rounded px-5 py-4 text-black shadow-2xl transition-opacity hover:opacity-90"
                style={{ backgroundColor: GOLD }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded bg-black/20 text-xs font-black text-black">
                  {itemCount}
                </span>
                <span className="text-sm font-semibold" style={{ fontFamily: POPPINS }}>View Order</span>
                <span className="text-sm font-semibold" style={{ fontFamily: POPPINS }}>${total.toFixed(2)}</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
