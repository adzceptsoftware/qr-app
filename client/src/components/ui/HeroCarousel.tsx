"use client";

import { useEffect, useRef, useState } from "react";

const AUTO_ADVANCE_MS = 4000;

export function HeroCarousel({
  images,
  fallbackLabel,
}: {
  images: string[];
  fallbackLabel: string;
}) {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const slides = images.length > 0 ? images : [null];

  function goTo(index: number) {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
    setActive(index);
  }

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        const el = trackRef.current;
        if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
        return next;
      });
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-0 overflow-x-auto rounded-2xl scrollbar-hide"
        onScroll={(e) => {
          const el = e.currentTarget;
          const index = Math.round(el.scrollLeft / el.clientWidth);
          setActive(index);
        }}
      >
        {slides.map((src, i) => (
          <div key={i} className="relative h-44 w-full shrink-0 snap-start overflow-hidden rounded-2xl bg-border sm:h-56">
            {src ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={src} alt={fallbackLabel} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/30 to-accent/10 text-sm font-medium text-foreground/60">
                {fallbackLabel}
              </div>
            )}
          </div>
        ))}
      </div>
      {slides.length > 1 && (
        <div className="mt-2 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === active ? "w-4 bg-accent" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
