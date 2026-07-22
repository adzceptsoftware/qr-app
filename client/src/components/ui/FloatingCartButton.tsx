import { CartIcon } from "./icons";

export function FloatingCartButton({
  itemCount,
  onClick,
  /** Lifts the button clear of the live order-status banner when one is shown. */
  raised = false,
}: {
  itemCount: number;
  onClick: () => void;
  raised?: boolean;
}) {
  if (itemCount === 0) return null;
  return (
    <button
      onClick={onClick}
      className={`fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-all active:scale-95 ${
        raised ? "bottom-[152px]" : "bottom-20"
      }`}
    >
      <CartIcon width={22} height={22} />
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-surface">
        {itemCount}
      </span>
    </button>
  );
}
