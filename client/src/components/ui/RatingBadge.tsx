export function RatingBadge({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center justify-center rounded-xl bg-accent px-3.5 py-2 text-base font-bold text-accent-foreground">
      {value.toFixed(1)}
    </span>
  );
}
