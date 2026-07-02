"use client";

import { useRef, useState } from "react";

export function ImageInput({ name, defaultValue }: { name: string; defaultValue?: string }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [broken, setBroken] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) { setError("Only image files are allowed"); return; }
    setUploading(true);
    setError(null);
    setBroken(false);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = (await res.json()) as { url?: string; message?: string };
      if (!res.ok || !data.url) throw new Error(data.message ?? "Upload failed");
      setUrl(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-1.5">
      <input type="hidden" name={name} value={url} />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const file = e.dataTransfer.files?.[0];
          if (file) uploadFile(file);
        }}
        className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed px-3 py-3 text-center transition-colors ${
          dragOver ? "border-stone-500 bg-stone-50" : "border-stone-300 hover:border-stone-400"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f); }}
        />
        {uploading ? (
          <span className="text-xs text-stone-400">Uploading…</span>
        ) : url && !broken ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt="" onError={() => setBroken(true)} className="h-16 w-16 rounded-lg object-cover" />
        ) : (
          <span className="text-xs text-stone-400">Drag & drop an image, or click to browse</span>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      {url && broken && !uploading && <p className="text-xs text-red-600">Image failed to load — check the URL.</p>}
      <input
        type="url"
        placeholder="…or paste an image URL"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setBroken(false); }}
        className="w-full rounded-lg border border-stone-300 px-3 py-2 text-xs"
      />
    </div>
  );
}
