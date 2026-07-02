"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrderDTO, OrderStatus } from "@/lib/order-types";
import { OrderCard, STATUS_CONFIG_DARK, STATUS_CONFIG_LIGHT } from "./order-card";

const THEME_KEY = "qr-app:kitchen-theme";

const FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "All Orders" },
  { key: "RECEIVED", label: "Received" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "SERVED", label: "Served" },
];

export function KitchenClient({ initialOrders, restaurantName }: { initialOrders: OrderDTO[]; restaurantName: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pollError, setPollError] = useState(false);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [light, setLight] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLight(window.localStorage.getItem(THEME_KEY) === "light");
  }, []);

  function toggleTheme() {
    setLight((prev) => {
      const next = !prev;
      window.localStorage.setItem(THEME_KEY, next ? "light" : "dark");
      return next;
    });
  }

  useEffect(() => {
    const poll = setInterval(async () => {
      try {
        const res = await fetch("/api/orders");
        if (res.ok) { setOrders(await res.json()); setPollError(false); }
        else setPollError(true);
      } catch { setPollError(true); }
    }, 5000);
    const timer = setInterval(() => tick((n) => n + 1), 15000);
    return () => { clearInterval(poll); clearInterval(timer); };
  }, []);

  async function advance(orderId: string, next: OrderStatus) {
    const snapshot = orders;
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: next } : o)));
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) setOrders(snapshot);
  }

  const counts = useMemo(
    () => ({
      RECEIVED: orders.filter((o) => o.status === "RECEIVED").length,
      PREPARING: orders.filter((o) => o.status === "PREPARING").length,
      READY: orders.filter((o) => o.status === "READY").length,
    }),
    [orders]
  );

  const visibleOrders = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);
  const statusConfig = light ? STATUS_CONFIG_LIGHT : STATUS_CONFIG_DARK;

  return (
    <div className={`min-h-screen pb-10 ${light ? "bg-stone-50" : "bg-stone-950"}`}>
      {/* Header */}
      <header className={`flex flex-col gap-3 border-b px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 ${
        light ? "border-stone-200" : "border-stone-800"
      }`}>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">{restaurantName}</p>
          <h1 className={`mt-1 text-2xl font-bold ${light ? "text-stone-900" : "text-white"}`}>Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className={`h-2 w-2 rounded-full ${pollError ? "bg-red-500" : "bg-emerald-400"}`} />
            <span className={pollError ? "text-red-400" : light ? "text-stone-500" : "text-stone-400"}>
              {pollError ? "Connection lost — retrying…" : "Live"}
            </span>
          </div>
          <button
            onClick={toggleTheme}
            aria-label={light ? "Switch to dark theme" : "Switch to light theme"}
            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm ${
              light ? "border-stone-200 bg-white hover:bg-stone-50" : "border-stone-800 bg-stone-900 hover:bg-stone-800"
            }`}
          >
            {light ? "🌙" : "☀️"}
          </button>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 px-4 py-4 sm:px-8">
        {(["RECEIVED", "PREPARING", "READY"] as const).map((status) => {
          const cfg = statusConfig[status];
          return (
            <div key={status} className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${cfg.bg}`}>
              <span className={`text-lg font-bold ${cfg.text}`}>{counts[status]}</span>
              <span className={light ? "text-xs text-stone-500" : "text-xs text-stone-400"}>{cfg.label}</span>
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
            className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? "border-amber-500 bg-amber-500/10 text-amber-600"
                : light
                  ? "border-stone-200 text-stone-500 hover:border-stone-300"
                  : "border-stone-800 text-stone-400 hover:border-stone-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {visibleOrders.map((order) => (
          <OrderCard key={order.id} order={order} onAdvance={advance} light={light} />
        ))}
        {visibleOrders.length === 0 && (
          <div className={`col-span-full rounded-xl border-2 border-dashed py-16 text-center ${
            light ? "border-stone-200" : "border-stone-800"
          }`}>
            <p className={light ? "text-sm text-stone-400" : "text-sm text-stone-500"}>No orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
