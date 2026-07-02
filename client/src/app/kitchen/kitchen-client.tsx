"use client";

import { useEffect, useMemo, useState } from "react";
import type { OrderDTO, OrderStatus } from "@/lib/order-types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEIVED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; dot: string }> = {
  RECEIVED:  { label: "Received",  text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",   dot: "bg-amber-400" },
  PREPARING: { label: "Preparing", text: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",     dot: "bg-blue-400" },
  READY:     { label: "Ready",     text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  SERVED:    { label: "Served",    text: "text-stone-400",   bg: "bg-stone-500/10 border-stone-500/30",   dot: "bg-stone-400" },
  CANCELLED: { label: "Cancelled", text: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",       dot: "bg-red-400" },
};

const NEXT_LABEL: Record<string, string> = {
  RECEIVED:  "Mark Preparing",
  PREPARING: "Mark Ready",
  READY:     "Mark Served",
};

const FILTERS: { key: "ALL" | OrderStatus; label: string }[] = [
  { key: "ALL", label: "All Orders" },
  { key: "RECEIVED", label: "Received" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "SERVED", label: "Served" },
];

function elapsed(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export function KitchenClient({ initialOrders, restaurantName }: { initialOrders: OrderDTO[]; restaurantName: string }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pollError, setPollError] = useState(false);
  const [filter, setFilter] = useState<"ALL" | OrderStatus>("ALL");
  const [, tick] = useState(0);

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

  return (
    <div className="min-h-screen bg-stone-950 pb-10">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-stone-800 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">{restaurantName}</p>
          <h1 className="mt-1 text-2xl font-bold text-white">Kitchen Display</h1>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium">
          <span className={`h-2 w-2 rounded-full ${pollError ? "bg-red-500" : "bg-emerald-400"}`} />
          <span className={pollError ? "text-red-400" : "text-stone-400"}>
            {pollError ? "Connection lost — retrying…" : "Live"}
          </span>
        </div>
      </header>

      {/* Stats */}
      <div className="flex flex-wrap gap-3 px-4 py-4 sm:px-8">
        {(["RECEIVED", "PREPARING", "READY"] as const).map((status) => {
          const cfg = STATUS_CONFIG[status];
          return (
            <div key={status} className={`flex items-center gap-2 rounded-lg border px-4 py-2 ${cfg.bg}`}>
              <span className={`text-lg font-bold ${cfg.text}`}>{counts[status]}</span>
              <span className="text-xs text-stone-400">{cfg.label}</span>
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
                ? "border-amber-500 bg-amber-500/10 text-amber-400"
                : "border-stone-800 text-stone-400 hover:border-stone-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Order cards */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 sm:px-8 lg:grid-cols-3">
        {visibleOrders.map((order) => {
          const cfg = STATUS_CONFIG[order.status];
          const next = NEXT_STATUS[order.status];
          return (
            <div key={order.id} className="rounded-xl border border-stone-800 bg-stone-900 p-4">
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-lg font-bold text-white">Table {order.tableNumber}</p>
                  <p className="text-xs text-stone-500">{elapsed(order.createdAt)}</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
                  {cfg.label}
                </span>
              </div>

              <ul className="mb-4 space-y-1.5 border-t border-stone-800 pt-3">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-stone-950">
                      {item.qty}
                    </span>
                    <span className="text-stone-200">{item.name}</span>
                  </li>
                ))}
              </ul>

              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-amber-400">${order.total.toFixed(2)}</span>
                {next ? (
                  <button
                    onClick={() => advance(order.id, next)}
                    className="rounded-lg border border-amber-500 bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition-colors"
                  >
                    {NEXT_LABEL[order.status]} →
                  </button>
                ) : (
                  <span className="text-xs text-stone-500">Completed</span>
                )}
              </div>
            </div>
          );
        })}
        {visibleOrders.length === 0 && (
          <div className="col-span-full rounded-xl border-2 border-dashed border-stone-800 py-16 text-center">
            <p className="text-sm text-stone-500">No orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
