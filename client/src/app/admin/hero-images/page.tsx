import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { HeroImagesForm } from "./hero-images-form";

type Settings = { id: string; name: string; address?: string; phone?: string; heroImages: string[] };

export default async function HeroImagesPage() {
  const session = await auth();
  const settings = await api<Settings>("/restaurant/settings", { token: session!.user.accessToken });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-stone-900">Menu Photos</h1>
      <HeroImagesForm initialImages={settings.heroImages} />
    </div>
  );
}
