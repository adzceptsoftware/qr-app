/** Lightweight shimmer placeholders shown via each route's loading.tsx. */

function Bar({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-border ${className}`} />;
}

export function DashboardSkeleton({
  variant = "list",
}: {
  variant?: "list" | "grid" | "stats";
}) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 space-y-2">
        <Bar className="h-7 w-48" />
        <Bar className="h-4 w-72" />
      </div>

      {variant === "stats" && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-5">
              <Bar className="h-4 w-24" />
              <Bar className="mt-3 h-8 w-16" />
            </div>
          ))}
        </div>
      )}

      {variant === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-surface p-4">
              <Bar className="mb-3 h-5 w-24" />
              <Bar className="mx-auto h-40 w-40" />
              <Bar className="mt-3 h-10 w-full" />
            </div>
          ))}
        </div>
      )}

      {(variant === "list" || variant === "stats") && (
        <div className="space-y-2.5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-4">
              <Bar className="h-11 w-11 rounded-full" />
              <div className="flex-1 space-y-2">
                <Bar className="h-4 w-40" />
                <Bar className="h-3 w-24" />
              </div>
              <Bar className="h-9 w-20" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
