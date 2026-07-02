import { StarIcon } from "./icons";

export function RatingBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-xs font-bold text-accent-foreground">
      <StarIcon width={12} height={12} />
      {value.toFixed(1)}
    </span>
  );
}
