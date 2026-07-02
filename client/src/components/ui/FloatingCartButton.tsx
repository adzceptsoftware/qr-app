import { CartIcon } from "./icons";

export function FloatingCartButton({
  itemCount,
  onClick,
}: {
  itemCount: number;
  onClick: () => void;
}) {
  if (itemCount === 0) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-lg transition-transform active:scale-95"
    >
      <CartIcon width={22} height={22} />
      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-bold text-surface">
        {itemCount}
      </span>
    </button>
  );
}
