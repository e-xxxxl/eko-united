import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";
import type { DemoGalleryItem } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos and videos from Eko United FC matchdays and behind the scenes.",
};

async function getGallery(type?: string): Promise<DemoGalleryItem[]> {
  return (await apiFetch<DemoGalleryItem[]>(`/gallery${type ? `?type=${type}` : ""}`, 900)) || [];
}

const tabs = [
  { value: undefined, label: "All" },
  { value: "photo", label: "Photos" },
  { value: "video", label: "Videos" },
] as const;

export default async function GalleryPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const params = await searchParams;
  const activeType = params.type === "photo" || params.type === "video" ? params.type : undefined;
  const items = await getGallery(activeType);

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        Matchday &amp; Behind the Scenes
      </p>
      <h1 className="display-title font-display mb-8">Gallery</h1>

      <div className="mb-10 flex gap-6 border-b border-navy/10">
        {tabs.map((tab) => {
          const active = activeType === tab.value;
          return (
            <Link
              key={tab.label}
              href={tab.value ? `/gallery?type=${tab.value}` : "/gallery"}
              className={clsx(
                "-mb-px border-b-2 pb-3 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                active ? "border-cyan text-navy" : "border-transparent text-navy/40 hover:text-navy"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {items.length === 0 ? (
        <p className="text-navy/50">Gallery items will appear here once uploaded by the club.</p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div key={item._id} className="relative aspect-video overflow-hidden bg-navy-light">
              {item.type === "photo" ? (
                <Image
                  src={item.url}
                  alt={item.caption || "Eko United FC"}
                  fill
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover transition-transform duration-500 ease-smooth hover:scale-105"
                />
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={item.url}
                  controls
                  preload="none"
                  className="h-full w-full object-cover"
                />
              )}
              {item.caption && (
                <p className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy-dark/90 to-transparent p-3 text-xs text-white/80">
                  {item.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
