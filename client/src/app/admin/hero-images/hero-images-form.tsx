"use client";

import { useState } from "react";
import { ImageInput } from "@/components/ui/ImageInput";
import { Card, btnPrimary } from "@/components/dashboard/ui";
import { updateHeroImages } from "./actions";

const MAX_IMAGES = 3;

export function HeroImagesForm({ initialImages }: { initialImages: string[] }) {
  const [slots, setSlots] = useState<string[]>(initialImages.length > 0 ? initialImages : [""]);
  const [saved, setSaved] = useState(false);

  return (
    <Card className="p-5">
      <form
        action={async (formData) => {
          await updateHeroImages(formData);
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        }}
        className="space-y-5"
      >
        <div className="grid gap-4 sm:grid-cols-3">
          {slots.map((value, i) => (
            <div key={i} className="space-y-1.5">
              <p className="text-sm font-medium text-muted">Photo {i + 1}</p>
              <ImageInput name="heroImages" defaultValue={value} />
              {slots.length > 1 && (
                <button
                  type="button"
                  onClick={() => setSlots((s) => s.filter((_, idx) => idx !== i))}
                  className="text-sm font-semibold text-danger hover:opacity-80"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>

        {slots.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => setSlots((s) => [...s, ""])}
            className="rounded-xl border border-dashed border-border px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-muted hover:bg-background"
          >
            + Add another photo
          </button>
        )}

        <div className="flex items-center gap-3 border-t border-border pt-4">
          <button className={btnPrimary}>Save photos</button>
          {saved && (
            <span className="inline-flex items-center gap-1.5 text-base font-semibold text-emerald-600">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Saved
            </span>
          )}
        </div>
      </form>
    </Card>
  );
}
