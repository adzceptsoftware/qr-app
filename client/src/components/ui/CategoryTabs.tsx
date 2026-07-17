export function CategoryTabs<T extends { id: string; name: string }>({
  items,
  activeId,
  onSelect,
}: {
  items: T[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-2.5 overflow-x-auto py-2 scrollbar-hide">
      {items.map((item) => {
        const active = item.id === activeId;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`shrink-0 rounded-xl px-5 py-3 text-sm font-semibold shadow-sm transition-colors ${
              active ? "bg-accent text-accent-foreground" : "bg-surface text-muted"
            }`}
          >
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
