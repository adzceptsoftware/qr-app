import type { OrderDTO, OrderStatus } from "@/lib/order-types";

type StatusStyle = { label: string; text: string; bg: string; dot: string };

export const STATUS_CONFIG: Record<string, StatusStyle> = {
  RECEIVED:  { label: "Received",  text: "text-amber-700",   bg: "bg-amber-50 border-amber-200",     dot: "bg-amber-500" },
  PREPARING: { label: "Preparing", text: "text-blue-700",    bg: "bg-blue-50 border-blue-200",       dot: "bg-blue-500" },
  READY:     { label: "Ready",     text: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", dot: "bg-emerald-500" },
  SERVED:    { label: "Served",    text: "text-muted",       bg: "bg-background border-border",      dot: "bg-muted" },
  CANCELLED: { label: "Cancelled", text: "text-danger",      bg: "bg-danger/10 border-danger/20",    dot: "bg-danger" },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEIVED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
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

export function OrderCard({
  order,
  onAdvance,
}: {
  order: OrderDTO;
  onAdvance: (orderId: string, next: OrderStatus) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const next = NEXT_STATUS[order.status];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-surface shadow-sm">
      <div className="flex items-start justify-between p-4">
        <div>
          <p className="text-xl font-bold text-foreground">{order.tableNumber}</p>
          <p className="text-sm text-muted">{elapsed(order.createdAt)}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${cfg.bg} ${cfg.text}`}>
          <span className={`h-2 w-2 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </span>
      </div>

      <ul className="flex-1 space-y-2.5 border-t border-border px-4 py-3.5">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 text-base">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">
              {item.qty}
            </span>
            <span className="font-medium text-foreground">{item.name}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-2 border-t border-border p-4">
        <span className="font-mono text-base font-bold text-foreground">Rs {order.total.toFixed(2)}</span>
        {next ? (
          <button
            onClick={() => onAdvance(order.id, next)}
            className="inline-flex min-h-[48px] items-center rounded-xl bg-accent px-4 py-2.5 text-base font-bold text-accent-foreground shadow-sm transition-colors hover:brightness-95 active:brightness-90"
          >
            {NEXT_LABEL[order.status]} →
          </button>
        ) : (
          <span className="text-sm font-semibold text-muted">✓ Completed</span>
        )}
      </div>
    </div>
  );
}
