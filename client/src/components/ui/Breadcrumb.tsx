export type BreadcrumbSegment = { label: string; onClick?: () => void };

export function Breadcrumb({ segments }: { segments: BreadcrumbSegment[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs text-muted" aria-label="Breadcrumb">
      {segments.map((segment, i) => {
        const isLast = i === segments.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-border">&gt;</span>}
            {segment.onClick && !isLast ? (
              <button onClick={segment.onClick} className="hover:text-foreground transition-colors">
                {segment.label}
              </button>
            ) : (
              <span className={isLast ? "font-medium text-foreground" : ""}>{segment.label}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
