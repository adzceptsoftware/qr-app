"use client";

import { useState } from "react";
import { ImageInput } from "@/components/ui/ImageInput";
import { updateHeroImages } from "./actions";

const MAX_IMAGES = 3;

export function HeroImagesForm({ initialImages }: { initialImages: string[] }) {
  const [slots, setSlots] = useState<string[]>(
    initialImages.length > 0 ? initialImages : [""]
  );
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateHeroImages(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }}
      className="space-y-4 rounded-xl border border-stone-200 bg-white p-4"
    >
      <p className="text-sm text-stone-500">
        Add up to {MAX_IMAGES} photos for the slideshow shown at the top of your customer menu.
      </p>

      <div className="grid gap-3 sm:grid-cols-3">
        {slots.map((value, i) => (
          <div key={i} className="space-y-1">
            <ImageInput name="heroImages" defaultValue={value} />
            {slots.length > 1 && (
              <button
                type="button"
                onClick={() => setSlots((s) => s.filter((_, idx) => idx !== i))}
                className="text-xs text-red-600 hover:text-red-800"
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
          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-50"
        >
          + Add another photo
        </button>
      )}

      <div className="flex items-center gap-3 border-t border-stone-100 pt-3">
        <button className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700">
          Save
        </button>
        {saved && <span className="text-sm text-emerald-700">Saved</span>}
      </div>
    </form>
  );
}
