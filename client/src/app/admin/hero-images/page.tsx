import { auth } from "@/lib/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/dashboard/ui";
import { HeroImagesForm } from "./hero-images-form";

type Settings = { id: string; name: string; address?: string; phone?: string; heroImages: string[] };

export default async function HeroImagesPage() {
  const session = await auth();
  const settings = await api<Settings>("/restaurant/settings", { token: session!.user.accessToken });

  return (
    <div className="max-w-3xl">
      <PageHeader title="Menu Photos" description="These photos appear in the slideshow at the top of your customer menu." />
      <HeroImagesForm initialImages={settings.heroImages} />
    </div>
  );
}
