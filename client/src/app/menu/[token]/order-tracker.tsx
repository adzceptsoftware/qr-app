"use client";

import { useEffect, useState } from "react";
import type { OrderStatus } from "@/lib/order-types";
import { Button } from "@/components/ui/Button";

export type TrackedOrder = {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  tableNumber: string;
  items: { id: string; name: string; qty: number }[];
};

/** The happy path a ticket walks through. CANCELLED sits outside it. */
const STEPS: { status: OrderStatus; label: string }[] = [
  { status: "RECEIVED", label: "Received" },
  { status: "PREPARING", label: "Preparing" },
  { status: "READY", label: "Ready" },
  { status: "SERVED", label: "Served" },
];

const COPY: Record<OrderStatus, { headline: string; detail: string; emoji: string }> = {
  RECEIVED:  { headline: "Order received",  detail: "The kitchen has your order and will start shortly.", emoji: "🧾" },
  PREPARING: { headline: "Being prepared",  detail: "Your food is being cooked right now.",              emoji: "👨‍🍳" },
  READY:     { headline: "Ready to serve",  detail: "It's plated up — heading to your table.",           emoji: "🔔" },
  SERVED:    { headline: "Served",          detail: "Enjoy your meal!",                                  emoji: "✅" },
  CANCELLED: { headline: "Order cancelled", detail: "Please speak to a member of staff.",                emoji: "⚠️" },
};

/**
 * Polls the public tracking endpoint while an order is live. Stops once the
 * order reaches a terminal state so a forgotten tab doesn't poll all night.
 */
export function useOrderTracking(orderId: string | null) {
  const [fetched, setFetched] = useState<TrackedOrder | null>(null);

  // Derived rather than cleared in an effect: stale data from a previous order
  // (or after the diner dismisses one) can never leak into the UI.
  const order = fetched && fetched.id === orderId ? fetched : null;

  // Once an order is served or cancelled there is nothing left to watch, so the
  // interval is torn down rather than polling a forgotten tab all night.
  const settled = order?.status === "SERVED" || order?.status === "CANCELLED";

  useEffect(() => {
    if (!orderId || settled) return;

    let cancelled = false;

    async function fetchStatus() {
      try {
        const res = await fetch(`/api/orders/${orderId}/track`, { cache: "no-store" });
        if (!res.ok || cancelled) return;
        const data = (await res.json()) as TrackedOrder;
        if (!cancelled) setFetched(data);
      } catch {
        // Transient network blips are ignored — the next tick retries.
      }
    }

    fetchStatus();
    const poll = setInterval(fetchStatus, 5000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [orderId, settled]);

  return order;
}

function currentStepIndex(status: OrderStatus) {
  return STEPS.findIndex((s) => s.status === status);
}

/** Full-screen confirmation + live progress, shown right after ordering. */
export function OrderTrackerScreen({
  orderId,
  order,
  tableNumber,
  onOrderMore,
}: {
  orderId: string;
  order: TrackedOrder | null;
  tableNumber: string;
  onOrderMore: () => void;
}) {
  const status = order?.status ?? "RECEIVED";
  const copy = COPY[status];
  const activeIndex = currentStepIndex(status);
  const cancelled = status === "CANCELLED";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-10 text-center">
      <div
        className={`mb-5 flex h-16 w-16 items-center justify-center rounded-full text-2xl ${
          cancelled ? "bg-danger/10" : "bg-accent text-accent-foreground"
        }`}
        aria-hidden
      >
        {copy.emoji}
      </div>

      <p className={`mb-1 text-xs font-semibold uppercase tracking-widest ${cancelled ? "text-danger" : "text-accent"}`}>
        {copy.headline}
      </p>
      <h1 className="mb-3 text-2xl font-bold text-foreground">
        {status === "SERVED" ? "Enjoy your meal!" : "Thank you!"}
      </h1>
      <p className="mb-6 max-w-xs text-sm text-muted" aria-live="polite">
        {copy.detail}
      </p>

      {/* Progress rail */}
      {!cancelled && (
        <div className="mb-8 w-full max-w-xs">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const done = i <= activeIndex;
              return (
                <div key={step.status} className="flex flex-1 items-center last:flex-none">
                  <span
                    className={`flex h-3 w-3 shrink-0 rounded-full transition-colors ${
                      done ? "bg-accent" : "bg-border"
                    } ${i === activeIndex ? "ring-4 ring-accent/25" : ""}`}
                  />
                  {i < STEPS.length - 1 && (
                    <span className={`h-0.5 flex-1 transition-colors ${i < activeIndex ? "bg-accent" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between">
            {STEPS.map((step, i) => (
              <span
                key={step.status}
                className={`text-[10px] font-medium ${i <= activeIndex ? "text-foreground" : "text-muted"}`}
              >
                {step.label}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 w-full max-w-xs rounded-2xl border border-border bg-surface px-6 py-4">
        <p className="text-xs text-muted">Order reference</p>
        <p className="mt-1 font-mono text-xl font-bold text-foreground">#{orderId.slice(-8).toUpperCase()}</p>
        <p className="mt-1 text-xs text-muted">Table {tableNumber}</p>

        {order && order.items.length > 0 && (
          <ul className="mt-4 space-y-1 border-t border-border pt-3 text-left">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between text-sm text-foreground">
                <span className="truncate">{item.name}</span>
                <span className="ml-3 shrink-0 text-muted">×{item.qty}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Button onClick={onOrderMore}>Order more</Button>
    </div>
  );
}

/** Slim live-status strip shown while the diner keeps browsing. */
export function OrderStatusBanner({
  order,
  onOpen,
  onDismiss,
}: {
  order: TrackedOrder | null;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const status = order?.status ?? "RECEIVED";
  const copy = COPY[status];
  const settled = status === "SERVED" || status === "CANCELLED";

  return (
    <div className="fixed inset-x-0 bottom-[68px] z-30 px-4">
      <div className="mx-auto flex max-w-md items-center gap-3 rounded-2xl border border-border bg-surface/95 px-4 py-2.5 shadow-lg backdrop-blur-md">
        <button onClick={onOpen} className="flex flex-1 items-center gap-3 text-left">
          <span className="text-lg" aria-hidden>{copy.emoji}</span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold text-foreground" aria-live="polite">
              {copy.headline}
            </span>
            <span className="block truncate text-xs text-muted">{copy.detail}</span>
          </span>
        </button>
        {settled && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss order status"
            className="shrink-0 rounded-full px-2 py-1 text-lg leading-none text-muted hover:text-foreground"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
