export function CategoryPills<T extends { id: string; name: string; icon?: string | null }>({
  items,
  activeId,
  onSelect,
}: {
  items: T[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2 overflow-x-auto px-4 py-2 scrollbar-hide">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors ${
              active
                ? "bg-accent text-accent-foreground"
                : "border border-border bg-surface text-muted"
            }`}
          >
            {item.icon ? `${item.icon} ` : ""}
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
