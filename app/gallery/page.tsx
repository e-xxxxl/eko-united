import type { Metadata } from "next";
import { apiFetch } from "@/lib/api";
import GalleryHero from "@/components/gallery/GalleryHero";
import GalleryWall, { type GalleryEntry } from "@/components/gallery/GalleryWall";
import { sectionMeta } from "@/lib/seo";

export const metadata: Metadata = sectionMeta("gallery");

async function getGallery(): Promise<GalleryEntry[]> {
  const all = await apiFetch<GalleryEntry[]>("/gallery", 900);
  return Array.isArray(all) ? all : [];
}

export default async function GalleryPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const params = await searchParams;
  const initialType = params.type === "photo" || params.type === "video" ? params.type : undefined;
  const items = await getGallery();
  const photos = items.filter((i) => i.type === "photo");
  const videos = items.filter((i) => i.type === "video");

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <GalleryHero photos={photos.map((p) => p.url)} photoCount={photos.length} videoCount={videos.length} />

      {items.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-16 text-center text-navy/50">
          Photos and videos will appear here once the club uploads them.
        </p>
      ) : (
        <GalleryWall items={items} initialType={initialType} />
      )}
    </main>
  );
}
