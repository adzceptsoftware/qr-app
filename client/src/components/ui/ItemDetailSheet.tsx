import { HeartIcon, XIcon } from "./icons";
import { QuantityStepper } from "./QuantityStepper";
import { Button } from "./Button";

export function ItemDetailSheet({
  name,
  description,
  price,
  imageUrl,
  ingredients,
  qty,
  liked,
  onClose,
  onToggleLike,
  onIncrement,
  onDecrement,
  onAddToOrder,
}: {
  name: string;
  description?: string | null;
  price: number;
  imageUrl?: string | null;
  ingredients?: string[];
  qty: number;
  liked: boolean;
  onClose: () => void;
  onToggleLike: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onAddToOrder: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[88vh] w-full max-w-md overflow-y-auto rounded-t-3xl bg-surface pb-6 sm:rounded-3xl">
        <div className="relative h-56 w-full bg-background">
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt={name} className="h-full w-full object-cover sm:rounded-t-3xl" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-5xl opacity-30">🍽️</div>
          )}
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 shadow-sm"
          >
            <XIcon width={16} height={16} />
          </button>
        </div>

        <div className="px-5 pt-4">
          <h2 className="text-lg font-bold text-foreground">{name}</h2>
          {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          <p className="mt-3 text-xl font-bold text-accent">Rs {price.toFixed(2)}</p>

          {ingredients && ingredients.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ingredients</p>
              <p className="mt-1 text-sm text-foreground">{ingredients.join(", ")}</p>
            </div>
          )}

          <div className="mt-5 flex items-center justify-between">
            <QuantityStepper
              qty={Math.max(qty, 1)}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
            <Button onClick={onAddToOrder}>Add to order</Button>
          </div>

          <button
            onClick={onToggleLike}
            className="mt-4 flex w-full items-center justify-center gap-2 text-sm font-medium text-muted"
          >
            <HeartIcon filled={liked} width={16} height={16} className={liked ? "text-danger" : ""} />
            {liked ? "Added to favourite" : "Add to favourite"}
          </button>
        </div>
      </div>
    </div>
  );
}
