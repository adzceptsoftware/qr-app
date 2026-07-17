"use client";

import { useEffect, useRef, useState } from "react";

export type SelectOption = { value: string; label: string };

/**
 * shadcn-style select: a themed trigger button + popover list with a check on the
 * active option. Submits its value through a hidden input so it works inside the
 * existing server-action <form> elements (name + defaultValue like a native select).
 */
export function Select({
  name,
  options,
  defaultValue,
  placeholder = "Select…",
  onChange,
}: {
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={value} />
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border bg-surface px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2 focus:ring-accent/30 ${
          open ? "border-accent" : "border-border hover:border-muted/60"
        }`}
      >
        <span className={selected ? "text-foreground" : "text-muted"}>{selected?.label ?? placeholder}</span>
        <svg
          className={`h-5 w-5 shrink-0 text-muted transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl"
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <li key={o.value}>
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  onClick={() => { setValue(o.value); setOpen(false); onChange?.(o.value); }}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-base transition-colors ${
                    active ? "bg-accent/10 font-semibold text-foreground" : "text-foreground hover:bg-background"
                  }`}
                >
                  <span className="truncate">{o.label}</span>
                  {active && (
                    <svg className="h-5 w-5 shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6 9 17l-5-5" />
                    </svg>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
