"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import LightboxTrigger from "@/components/Lightbox";

export type GalleryEntry = { _id: string; type: "photo" | "video"; url: string; caption?: string; tags?: string[] };

type Filter = "all" | "photo" | "video";

// The gallery as a wall: every photo at its own proportions (nothing is cropped),
// filtered instantly by kind and by tag, and opened full screen with a tap. On a
// hover (or always, on a phone) a caption and number slide up over the photo.
export default function GalleryWall({ items, initialType }: { items: GalleryEntry[]; initialType?: Filter }) {
  const [type, setType] = useState<Filter>(initialType || "all");
  const [tag, setTag] = useState<string | null>(null);

  const photosAll = items.filter((i) => i.type === "photo");
  const videosAll = items.filter((i) => i.type === "video");

  // Tags used by at least one item, most used first.
  const tags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const i of items) for (const t of i.tags || []) counts.set(t, (counts.get(t) || 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([t]) => t);
  }, [items]);

  const shown = items.filter((i) => (type === "all" || i.type === type) && (!tag || (i.tags || []).includes(tag)));
  const shownPhotos = shown.filter((i) => i.type === "photo");
  const viewerPhotos = shownPhotos.map((p) => ({ src: p.url, alt: p.caption || "Eko United FC", caption: p.caption }));

  const pills: { value: Filter; label: string; count: number }[] = [
    { value: "all", label: "Everything", count: items.length },
    { value: "photo", label: "Photos", count: photosAll.length },
    { value: "video", label: "Videos", count: videosAll.length },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Show">
          {pills
            .filter((p) => p.value === "all" || p.count > 0)
            .map((p) => (
              <button
                key={p.value}
                type="button"
                role="tab"
                aria-selected={type === p.value}
                onClick={() => setType(p.value)}
                className={clsx(
                  "flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] transition-colors duration-200 ease-smooth",
                  type === p.value ? "bg-navy text-white" : "bg-navy/[0.06] text-navy/60 hover:bg-navy/12"
                )}
              >
                {p.label}
                <span className={clsx("font-display text-base leading-none tracking-normal", type === p.value ? "text-cyan" : "text-navy/35")}>{p.count}</span>
              </button>
            ))}
        </div>

        {tags.length > 0 && (
          <div className="-mx-6 flex max-w-full gap-2 overflow-x-auto px-6 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tags.map((t) => (
              <button
                key={t}
                type="button"
                aria-pressed={tag === t}
                onClick={() => setTag(tag === t ? null : t)}
                className={clsx(
                  "shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold uppercase tracking-wide transition-colors duration-200 ease-smooth",
                  tag === t ? "border-cyan bg-cyan/15 text-navy" : "border-navy/15 text-navy/55 hover:border-navy/40"
                )}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {shown.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-14 text-center text-navy/50">Nothing here yet. Try another filter.</p>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
          {shown.map((item, i) => {
            const photoIndex = shownPhotos.indexOf(item);
            const brandTile = type === "all" && !tag && shown.length > 6 && i === 4;
            return (
              <div key={item._id} className="contents">
                {brandTile && (
                  <div className="relative mb-4 flex aspect-[4/5] break-inside-avoid flex-col justify-between overflow-hidden rounded-2xl bg-navy-dark p-6 text-white">
                    <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_60%_at_100%_0%,rgba(101,203,233,0.28),transparent_70%),repeating-linear-gradient(115deg,transparent_0_40px,rgba(255,255,255,0.04)_40px_41px)]" />
                    <Image src="/brand/crest-mark.png" alt="" width={64} height={64} className="relative h-14 w-14" />
                    <div className="relative">
                      <p className="font-display text-5xl uppercase leading-[0.92]">The Uga Boys</p>
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.22em] text-cyan">
                        {photosAll.length} photos{videosAll.length > 0 ? ` · ${videosAll.length} videos` : ""}
                      </p>
                    </div>
                  </div>
                )}

                <figure className="group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-navy/[0.06] shadow-[0_1px_0_rgba(10,36,77,0.04)]">
                  {item.type === "photo" ? (
                    <LightboxTrigger photos={viewerPhotos} index={photoIndex} label={item.caption ? `Enlarge: ${item.caption}` : "Enlarge photo"}>
                      <Image
                        src={item.url}
                        alt={item.caption || "Eko United FC"}
                        width={1600}
                        height={1067}
                        sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 31vw, (min-width: 640px) 47vw, 100vw"
                        className="h-auto w-full transition-transform duration-[900ms] ease-smooth group-hover:scale-[1.05]"
                      />
                      <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/85 via-navy-dark/10 to-transparent opacity-100 transition-opacity duration-500 ease-smooth sm:opacity-0 sm:group-hover:opacity-100"
                      />
                      <span aria-hidden className="pointer-events-none absolute left-4 top-3 font-display text-3xl leading-none text-cyan opacity-0 transition-opacity duration-500 ease-smooth sm:group-hover:opacity-100">
                        {String(photoIndex + 1).padStart(2, "0")}
                      </span>
                      <span aria-hidden className="pointer-events-none absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/15 text-white opacity-0 ring-1 ring-white/40 backdrop-blur-sm transition-opacity duration-500 ease-smooth sm:group-hover:opacity-100">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
                        </svg>
                      </span>
                      {(item.caption || (item.tags && item.tags.length > 0)) && (
                        <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-0 p-4 text-left transition-transform duration-500 ease-smooth sm:translate-y-2 sm:group-hover:translate-y-0">
                          {item.caption && <span className="block text-sm font-semibold leading-snug text-white sm:opacity-0 sm:transition-opacity sm:duration-500 sm:group-hover:opacity-100">{item.caption}</span>}
                          {item.tags && item.tags.length > 0 && (
                            <span className="mt-1.5 hidden gap-1.5 sm:group-hover:flex">
                              {item.tags.slice(0, 3).map((t) => (
                                <span key={t} className="rounded-full bg-cyan/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-navy-dark">
                                  {t}
                                </span>
                              ))}
                            </span>
                          )}
                        </span>
                      )}
                    </LightboxTrigger>
                  ) : (
                    <>
                      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                      <video src={`${item.url}#t=0.1`} controls preload="metadata" playsInline className="aspect-video w-full bg-navy-dark object-contain" />
                      <span className="pointer-events-none absolute left-3 top-3 rounded-md bg-navy-dark/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-cyan backdrop-blur-sm">Video</span>
                      {item.caption && <figcaption className="bg-navy-dark px-4 py-3 text-sm font-semibold text-white">{item.caption}</figcaption>}
                    </>
                  )}
                </figure>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
