"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "qr-app:kitchen-sound";

/** Two-tone "ding-dong": A5 then D6. Pitched to carry over kitchen noise. */
const TONES: { freq: number; startAt: number; duration: number }[] = [
  { freq: 880.0, startAt: 0, duration: 0.45 },
  { freq: 1174.7, startAt: 0.18, duration: 0.55 },
];

/**
 * Synthesizes the new-order alert in-browser — no audio asset to ship or host.
 *
 * Browsers refuse to start an AudioContext without a user gesture, so the
 * context is created lazily on the first toggle/click and resumed if the
 * browser suspended it (which also happens when a tab is backgrounded).
 */
export function useOrderChime() {
  const [enabled, setEnabled] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Restore the mute preference after mount (localStorage is SSR-unavailable).
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved !== null) setEnabled(saved === "on");
    } catch {
      // Private-mode or blocked storage — fall back to the default (on).
    }
  }, []);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!ctxRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      ctxRef.current = new Ctor();
    }
    return ctxRef.current;
  }, []);

  /** Emits the chime unconditionally — callers decide whether sound is on. */
  const emit = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;

    // A tab that has been backgrounded comes back suspended.
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    for (const tone of TONES) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = tone.freq;

      // Quick attack, exponential decay — a bell rather than a beep.
      const start = now + tone.startAt;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + tone.duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + tone.duration + 0.05);
    }
  }, [getContext]);

  const play = useCallback(() => {
    if (enabled) emit();
  }, [enabled, emit]);

  const toggle = useCallback(() => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
    } catch {
      // Preference just won't persist; the toggle still works this session.
    }
    if (next) {
      // Runs inside the click handler, so it's a valid gesture to unlock audio
      // with — and the preview confirms to staff that sound actually works.
      emit();
    }
  }, [enabled, emit]);

  useEffect(() => {
    return () => { void ctxRef.current?.close(); };
  }, []);

  return { enabled, toggle, play };
}
