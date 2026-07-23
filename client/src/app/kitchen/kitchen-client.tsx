"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { OrderDTO, OrderStatus } from "@/lib/order-types";
import { OrderCard, STATUS_CONFIG } from "./order-card";
import { useOrderChime } from "./use-order-chime";

const FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "RECEIVED", label: "Received" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "SERVED", label: "Served" },
  { key: "ALL", label: "All" },
];

/** Only show orders placed today — yesterday's tickets clear out automatically. */
function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function KitchenClient({ initialOrders, restaurantName }: { initialOrders: OrderDTO[]; restaurantName: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pollError, setPollError] = useState(false);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("RECEIVED");
  const [tickN, tick] = useState(0);
  const { enabled: soundOn, toggle: toggleSound, play: playChime } = useOrderChime();

  // Order ids already seen, so only genuinely new tickets ring. Seeded with the
  // server-rendered batch so a page refresh never re-announces old orders.
  const seenIds = useRef(new Set(initialOrders.map((o) => o.id)));

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        if (res.ok) {
          const next = (await res.json()) as OrderDTO[];
          const isNew = next.some((o) => o.status === "RECEIVED" && !seenIds.current.has(o.id));
          // Track every id, not just the new ones, so an order that arrives
          // already past RECEIVED can't ring later.
          for (const o of next) seenIds.current.add(o.id);
          setOrders(next);
          setPollError(false);
          if (isNew) playChime();
        } else if (res.status === 401) {
          // The backend token (12h) outlives the login cookie check — once it
          // expires every poll 401s and the display silently freezes. Send
          // staff back through login so a fresh token is minted.
          window.location.assign("/login?callbackUrl=%2Fkitchen");
        }
        else setPollError(true);
      } catch { setPollError(true); }
    }, 5000);
    const timer = setInterval(() => tick((n) => n + 1), 15000);
    return () => { clearInterval(poll); clearInterval(timer); };
  }, [playChime]);

  async function advance(orderId: string, next: OrderStatus) {
    const snapshot = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)));
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (res.status === 401) {
      window.location.assign("/login?callbackUrl=%2Fkitchen");
      return;
    }
    if (!res.ok) setOrders(snapshot);
  }

  // Re-derive on every poll and on the 15s tick so day-rollover drops old tickets.
  const todaysOrders = useMemo(
    () => orders.filter((o) => isToday(o.createdAt)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [orders, tickN]
  );

  const counts = useMemo(
    () => ({
      RECEIVED: todaysOrders.filter((o) => o.status === "RECEIVED").length,
      PREPARING: todaysOrders.filter((o) => o.status === "PREPARING").length,
      READY: todaysOrders.filter((o) => o.status === "READY").length,
    }),
    [todaysOrders]
  );

  const visibleOrders = filter === "ALL" ? todaysOrders : todaysOrders.filter((o) => o.status === filter);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 flex flex-col gap-3 border-b border-border bg-surface/90 px-4 py-4 backdrop-blur sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <path d="M8 21h8M12 17v4" />
            </svg>
          </span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">{restaurantName}</p>
            <h1 className="text-2xl font-bold text-foreground">Kitchen Display</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSound}
            aria-pressed={soundOn}
            title={soundOn ? "New-order sound is on — tap to mute" : "New-order sound is muted — tap to unmute"}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-base font-semibold transition-colors ${
              soundOn
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:border-muted/60"
            }`}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 5 6 9H2v6h4l5 4V5z" />
              {soundOn ? (
                <>
                  <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                  <path d="M18.5 5.5a9 9 0 0 1 0 13" />
                </>
              ) : (
                <path d="M22 9l-6 6M16 9l6 6" />
              )}
            </svg>
            <span>{soundOn ? "Sound on" : "Muted"}</span>
          </button>

          <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-base font-semibold">
            <span className={`h-2.5 w-2.5 rounded-full ${pollError ? "bg-danger" : "animate-pulse bg-emerald-500"}`} />
            <span className={pollError ? "text-danger" : "text-muted"}>{pollError ? "Reconnecting…" : "Live"}</span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 px-4 py-4 sm:px-8">
        {(["RECEIVED", "PREPARING", "READY"] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className={`rounded-2xl border p-4 ${cfg.bg}`}>
              <p className={`text-4xl font-bold ${cfg.text}`}>{counts[status]}</p>
              <p className="mt-1 text-sm font-medium text-muted">{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-4 scrollbar-hide sm:px-8">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`inline-flex min-h-[44px] shrink-0 items-center rounded-full border px-5 py-2 text-base font-semibold transition-colors ${
              filter === f.key
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-muted hover:border-muted/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 gap-4 px-4 pb-10 sm:grid-cols-2 sm:px-8 lg:grid-cols-3 xl:grid-cols-4">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} onAdvance={advance} />
        ))}
        {visibleOrders.length === 0 && (
          <div className="col-span-full rounded-2xl border-2 border-dashed border-border py-20 text-center">
            <p className="text-base text-muted">No orders here right now</p>
          </div>
        )}
      </div>
    </div>
  );
}
