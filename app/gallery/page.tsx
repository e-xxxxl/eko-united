import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { clsx } from "clsx";
import { apiFetch } from "@/lib/api";
import type { DemoGalleryItem } from "@/lib/demoData";
import LightboxTrigger from "@/components/Lightbox";

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
  const photos = items.filter((i) => i.type === "photo");
  const viewerPhotos = photos.map((p) => ({ src: p.url, alt: p.caption || "Eko United FC", caption: p.caption }));

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
        // A masonry wall: every photo shows whole, at its own proportions, with
        // no frame, crop, panel or overlay. Captions sit underneath.
        <div data-reveal-stagger="scale" className="columns-1 gap-3 sm:columns-2 lg:columns-3">
          {items.map((item) => (
            <figure key={item._id} className="group mb-3 break-inside-avoid">
              {item.type === "photo" ? (
                <div className="overflow-hidden rounded-xl">
                  <LightboxTrigger photos={viewerPhotos} index={photos.indexOf(item)} label="Enlarge photo">
                    <Image
                      src={item.url}
                      alt={item.caption || "Eko United FC"}
                      width={1600}
                      height={1067}
                      sizes="(min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                      className="h-auto w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.03]"
                    />
                  </LightboxTrigger>
                </div>
              ) : (
                // eslint-disable-next-line jsx-a11y/media-has-caption
                <video
                  src={item.url}
                  controls
                  preload="none"
                  className="aspect-video w-full rounded-xl bg-navy-dark object-contain"
                />
              )}
              {item.caption && <figcaption className="mt-2 text-xs leading-snug text-navy/55">{item.caption}</figcaption>}
            </figure>
          ))}
        </div>
      )}
    </main>
  );
}
