import type { NavKey } from "@/components/ui/BottomNav";

type CartLine = { menuItemId: string; name: string; price: number; qty: number };

type SessionState = {
  cart: Record<string, CartLine>;
  orderId: string | null;
  nav: NavKey;
};

function storageKey(tableToken: string) {
  return `qr-app:session:${tableToken}`;
}

export function loadSession(tableToken: string): Partial<SessionState> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.sessionStorage.getItem(storageKey(tableToken));
    return raw ? (JSON.parse(raw) as Partial<SessionState>) : {};
  } catch {
    return {};
  }
}

export function saveSession(tableToken: string, state: SessionState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(storageKey(tableToken), JSON.stringify(state));
}

export function clearSession(tableToken: string) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(storageKey(tableToken));
}
