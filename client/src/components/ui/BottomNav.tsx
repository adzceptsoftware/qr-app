import type { ComponentType } from "react";
import { HomeIcon, MenuIcon, ReceiptIcon, HeartIcon } from "./icons";

export type NavKey = "home" | "menu" | "orders" | "favourites";

const ITEMS: { key: NavKey; label: string; Icon: ComponentType<{ width?: number; height?: number; className?: string }> }[] = [
  { key: "home", label: "Home", Icon: HomeIcon },
  { key: "menu", label: "Menu", Icon: MenuIcon },
  { key: "orders", label: "Orders", Icon: ReceiptIcon },
  { key: "favourites", label: "Saved", Icon: HeartIcon },
];

export function BottomNav({
  active,
  onChange,
}: {
  active: NavKey;
  onChange: (key: NavKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2">
        {ITEMS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onChange(key)}
              className="flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5"
            >
              <Icon
                width={20}
                height={20}
                className={isActive ? "text-accent" : "text-muted"}
              />
              <span className={`text-[10px] font-medium ${isActive ? "text-accent" : "text-muted"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
