import { HeartIcon, PlusIcon } from "./icons";
import { QuantityStepper } from "./QuantityStepper";

export function MenuItemCard({
  name,
  description,
  price,
  imageUrl,
  qty,
  liked,
  onOpen,
  onToggleLike,
  onIncrement,
  onDecrement,
}: {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  qty: number;
  liked: boolean;
  onOpen: () => void;
  onToggleLike: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
      <button onClick={onOpen} className="relative block h-32 w-full shrink-0 overflow-hidden bg-background sm:h-36">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl opacity-30">🍽️</div>
        )}
        <span
          role="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike();
          }}
          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-surface/90 shadow-sm"
        >
          <HeartIcon
            filled={liked}
            width={14}
            height={14}
            className={liked ? "text-danger" : "text-muted"}
          />
        </span>
      </button>

      <div className="flex flex-1 flex-col p-2.5">
        <button onClick={onOpen} className="text-left">
          <h3 className="text-sm font-semibold leading-snug text-foreground">{name}</h3>
          {description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{description}</p>
          )}
        </button>

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-sm font-bold text-accent">Rs {price.toFixed(2)}</span>
          {qty === 0 ? (
            <button
              onClick={onIncrement}
              className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1.5 text-[11px] font-semibold text-accent-foreground transition-transform active:scale-95"
            >
              <PlusIcon width={11} height={11} /> Add
            </button>
          ) : (
            <QuantityStepper qty={qty} onIncrement={onIncrement} onDecrement={onDecrement} size="sm" />
          )}
        </div>
      </div>
    </div>
  );
}
