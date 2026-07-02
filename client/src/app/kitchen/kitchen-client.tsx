"use client";

import { useEffect, useState } from "react";
import type { OrderDTO, OrderStatus } from "@/lib/order-types";

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEIVED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  RECEIVED:  { label: "New",       color: "text-amber-700",   bg: "bg-amber-50 border-amber-200",   dot: "bg-amber-400" },
  PREPARING: { label: "Preparing", color: "text-blue-700",    bg: "bg-blue-50 border-blue-200",     dot: "bg-blue-400" },
  READY:     { label: "Ready",     color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-400" },
  SERVED:    { label: "Served",    color: "text-stone-500",   bg: "bg-stone-50 border-stone-200",   dot: "bg-stone-300" },
  CANCELLED: { label: "Cancelled", color: "text-red-600",     bg: "bg-red-50 border-red-200",       dot: "bg-red-400" },
};

const NEXT_LABEL: Record<string, string> = {
  RECEIVED:  "Start Preparing",
  PREPARING: "Mark Ready",
  READY:     "Mark Served",
};

function elapsed(createdAt: string) {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  return `${Math.floor(diff / 60)}m ago`;
}

export function KitchenClient({ initialOrders }: { initialOrders: OrderDTO[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [pollError, setPollError] = useState(false);
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
    setOrders((prev) =>
      next === "SERVED"
        ? prev.filter((o) => o.id !== orderId)
        : prev.map((o) => (o.id === orderId ? { ...o, status: next } : o))
    );
    const res = await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    if (!res.ok) setOrders(snapshot);
  }

  const columns: OrderStatus[] = ["RECEIVED", "PREPARING", "READY"];

  return (
    <div className="min-h-screen bg-stone-100">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Kitchen Display</h1>
          <p className="text-xs text-stone-400">Auto-refreshes every 5 seconds</p>
        </div>
        {pollError && (
          <span className="rounded-full bg-red-50 border border-red-200 px-3 py-1 text-xs font-medium text-red-600">
            ⚠ Connection lost — retrying…
          </span>
        )}
        <div className="flex gap-4 text-sm">
          {columns.map((status) => {
            const cfg = STATUS_CONFIG[status];
            const count = orders.filter((o) => o.status === status).length;
            return (
              <div key={status} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
                <span className="text-stone-500">{cfg.label}</span>
                <span className="font-bold text-stone-900">{count}</span>
              </div>
            );
          })}
        </div>
      </header>

      {/* Columns */}
      <div className="grid grid-cols-3 gap-4 p-6">
        {columns.map((status) => {
          const cfg = STATUS_CONFIG[status];
          const colOrders = orders.filter((o) => o.status === status);
          return (
            <div key={status}>
              <div className={`mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 ${cfg.bg}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${cfg.dot}`} />
                <span className={`text-sm font-semibold ${cfg.color}`}>{cfg.label}</span>
                <span className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold ${cfg.bg} ${cfg.color}`}>
                  {colOrders.length}
                </span>
              </div>

              <div className="space-y-3">
                {colOrders.map((order) => {
                  const next = NEXT_STATUS[order.status];
                  return (
                    <div
                      key={order.id}
                      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
                    >
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="text-lg font-bold text-stone-900">
                            Table {order.tableNumber}
                          </p>
                          <p className="text-xs text-stone-400">{elapsed(order.createdAt)}</p>
                        </div>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 font-mono text-xs text-stone-500">
                          #{order.id.slice(-6).toUpperCase()}
                        </span>
                      </div>

                      <ul className="mb-4 space-y-1.5 border-t border-stone-100 pt-3">
                        {order.items.map((item) => (
                          <li key={item.id} className="flex items-center gap-2 text-sm">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">
                              {item.qty}
                            </span>
                            <span className="text-stone-800">{item.name}</span>
                          </li>
                        ))}
                      </ul>

                      {next && (
                        <button
                          onClick={() => advance(order.id, next)}
                          className={`w-full rounded-lg py-2 text-sm font-semibold transition-colors ${
                            next === "SERVED"  ? "bg-emerald-600 text-white hover:bg-emerald-700" :
                            next === "READY"   ? "bg-blue-600 text-white hover:bg-blue-700" :
                                                 "bg-stone-900 text-white hover:bg-stone-700"
                          }`}
                        >
                          {NEXT_LABEL[order.status]}
                        </button>
                      )}
                    </div>
                  );
                })}
                {colOrders.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed border-stone-200 py-10 text-center">
                    <p className="text-sm text-stone-400">No orders</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
