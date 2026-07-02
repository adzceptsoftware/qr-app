import { HomeIcon, MailIcon, BellIcon, HeartIcon } from "./icons";

export type NavKey = "home" | "menu" | "favourites";

export function BottomNav({
  active,
  onChange,
}: {
  active: NavKey;
  onChange: (key: NavKey) => void;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-md items-center justify-around px-2 py-2.5">
        <button
          onClick={() => onChange("home")}
          aria-label="Home"
          className="flex items-center justify-center rounded-xl px-4 py-1.5"
        >
          <HomeIcon width={20} height={20} className={active === "home" ? "text-accent" : "text-muted"} />
        </button>
        <button
          aria-label="Messages"
          className="flex items-center justify-center rounded-xl px-4 py-1.5 text-muted"
        >
          <MailIcon width={20} height={20} />
        </button>
        <button
          aria-label="Notifications"
          className="flex items-center justify-center rounded-xl px-4 py-1.5 text-muted"
        >
          <BellIcon width={20} height={20} />
        </button>
        <button
          onClick={() => onChange("favourites")}
          aria-label="Favourites"
          className="flex items-center justify-center rounded-xl px-4 py-1.5"
        >
          <HeartIcon width={20} height={20} className={active === "favourites" ? "text-accent" : "text-muted"} />
        </button>
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
