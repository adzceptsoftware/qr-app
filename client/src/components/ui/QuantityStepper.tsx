import { MinusIcon, PlusIcon } from "./icons";

export function QuantityStepper({
  qty,
  onIncrement,
  onDecrement,
  size = "md",
}: {
  qty: number;
  onIncrement: () => void;
  onDecrement: () => void;
  size?: "sm" | "md";
}) {
  const btn = size === "sm" ? "h-6 w-6" : "h-8 w-8";
  const iconSize = size === "sm" ? 12 : 14;
  return (
    <div className="flex items-center gap-1 rounded-full bg-accent px-1 py-1 text-accent-foreground">
      <button
        onClick={onDecrement}
        aria-label="Decrease quantity"
        className={`flex ${btn} items-center justify-center rounded-full bg-accent-foreground/10 transition-transform active:scale-90`}
      >
        <MinusIcon width={iconSize} height={iconSize} />
      </button>
      <span className="w-4 text-center text-sm font-bold">{qty}</span>
      <button
        onClick={onIncrement}
        aria-label="Increase quantity"
        className={`flex ${btn} items-center justify-center rounded-full bg-accent-foreground/10 transition-transform active:scale-90`}
      >
        <PlusIcon width={iconSize} height={iconSize} />
      </button>
    </div>
  );
}
