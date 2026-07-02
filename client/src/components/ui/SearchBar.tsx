import { SearchIcon } from "./icons";

export function SearchBar({
  value,
  onChange,
  placeholder = "Search menu",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5 text-sm text-foreground shadow-sm">
      <SearchIcon width={16} height={16} className="text-muted" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-muted"
      />
    </div>
  );
}
