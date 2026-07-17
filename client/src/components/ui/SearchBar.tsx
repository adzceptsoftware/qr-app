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
    <div className="flex items-center gap-2 rounded-full bg-surface px-5 py-3 text-sm text-foreground shadow-sm">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent outline-none placeholder:text-muted"
      />
      <SearchIcon width={18} height={18} className="text-muted" />
    </div>
  );
}
