import { XIcon } from "./icons";
import { QuantityStepper } from "./QuantityStepper";
import { Button } from "./Button";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

export function CartSheet({
  lines,
  total,
  placing,
  error,
  onClose,
  onIncrement,
  onDecrement,
  onPlaceOrder,
}: {
  lines: CartLine[];
  total: number;
  placing: boolean;
  error: string | null;
  onClose: () => void;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onPlaceOrder: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface px-5 pb-8 pt-5">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Your Order</h3>
          <button onClick={onClose} className="text-muted">
            <XIcon width={18} height={18} />
          </button>
        </div>

        <ul className="mb-4 max-h-72 divide-y divide-border overflow-y-auto">
          {lines.map((line) => (
            <li key={line.menuItemId} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <QuantityStepper
                  qty={line.qty}
                  size="sm"
                  onIncrement={() => onIncrement(line.menuItemId)}
                  onDecrement={() => onDecrement(line.menuItemId)}
                />
                <span className="text-sm text-foreground">{line.name}</span>
              </div>
              <span className="text-sm font-semibold text-accent">
                Rs {(line.price * line.qty).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>

        <div className="mb-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm text-muted">Total</span>
          <span className="text-xl font-bold text-foreground">Rs {total.toFixed(2)}</span>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">{error}</p>
        )}

        <Button onClick={onPlaceOrder} disabled={placing} className="w-full">
          {placing ? "Placing order…" : `Place Order · Rs ${total.toFixed(2)}`}
        </Button>
      </div>
    </div>
  );
}
