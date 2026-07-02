import type { OrderDTO, OrderStatus } from "@/lib/order-types";

export const STATUS_CONFIG: Record<string, { label: string; text: string; bg: string; dot: string }> = {
  RECEIVED:  { label: "Received",  text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/30",   dot: "bg-amber-400" },
  PREPARING: { label: "Preparing", text: "text-blue-400",    bg: "bg-blue-500/10 border-blue-500/30",     dot: "bg-blue-400" },
  READY:     { label: "Ready",     text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30", dot: "bg-emerald-400" },
  SERVED:    { label: "Served",    text: "text-stone-400",   bg: "bg-stone-500/10 border-stone-500/30",   dot: "bg-stone-400" },
  CANCELLED: { label: "Cancelled", text: "text-red-400",     bg: "bg-red-500/10 border-red-500/30",       dot: "bg-red-400" },
};

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  RECEIVED: "PREPARING",
  PREPARING: "READY",
  READY: "SERVED",
};

const NEXT_LABEL: Record<string, string> = {
  RECEIVED:  "Mark Preparing",
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
    <div className="rounded-xl border border-stone-800 bg-stone-900 p-4">
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
            onClick={() => onAdvance(order.id, next)}
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
}
