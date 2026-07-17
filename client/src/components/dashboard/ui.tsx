import type { ReactNode } from "react";

/**
 * Shared class tokens for the staff dashboards (admin / super-admin / kitchen).
 * Uses the SAME theme tokens as the customer app (background / surface / foreground
 * / muted / border / accent) and larger, touch-friendly sizing so staff can use it
 * quickly on a touch screen without mis-taps.
 */
export const inputClass =
  "w-full rounded-xl border border-border bg-surface px-4 py-3 text-base text-foreground placeholder:text-muted transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30";

export const labelClass = "mb-1.5 block text-sm font-medium text-muted";

/** Primary = amber accent, dark text — colourful and easy to spot. */
export const btnPrimary =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-base font-bold text-accent-foreground shadow-sm transition-colors hover:brightness-95 active:brightness-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-60";

export const btnSecondary =
  "inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-base font-semibold text-foreground transition-colors hover:bg-background focus:outline-none focus-visible:ring-2 focus-visible:ring-border";

/** Coloured pill actions for lists — spaced out so they are hard to mis-tap. */
export const actionEdit =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border";

export const actionDelete =
  "inline-flex min-h-[40px] items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-danger transition-colors hover:bg-danger/10";

/** Large square icon buttons (48px) for edit / delete on touch screens. */
const iconBtnBase =
  "inline-flex h-12 w-12 items-center justify-center rounded-xl border transition-colors focus:outline-none focus-visible:ring-2";
export const iconEdit = `${iconBtnBase} border-border bg-surface text-foreground hover:bg-background focus-visible:ring-accent/40`;
export const iconDelete = `${iconBtnBase} border-border bg-surface text-danger hover:border-danger/40 hover:bg-danger/10 focus-visible:ring-danger/40`;

export function PencilIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

export function TrashIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
    </svg>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted sm:text-base">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-border bg-surface shadow-sm ${className}`}>{children}</div>
  );
}

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 px-6 py-14 text-center">
      {icon && <div className="mb-3 text-muted">{icon}</div>}
      <p className="text-base font-semibold text-foreground">{title}</p>
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}
