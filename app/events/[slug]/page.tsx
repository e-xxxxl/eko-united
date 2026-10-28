import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { apiFetch } from "@/lib/api";
import FramedImage from "@/components/FramedImage";
import ShareLinks from "@/components/ShareLinks";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import LightboxTrigger, { type LightboxPhoto } from "@/components/Lightbox";
import { formatEventDate, type ClubEvent } from "@/lib/eventTypes";

async function getEvent(slug: string): Promise<ClubEvent | null> {
  return await apiFetch<ClubEvent>(`/events/${slug}`, 600);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) return { title: "Event Not Found" };
  const description = (event.description || `${event.name}, an Eko United FC event.`).slice(0, 155);
  return {
    title: event.name,
    description,
    alternates: { canonical: `https://ekounitedfc.com/events/${event.slug}` },
    openGraph: { type: "website", siteName: "Eko United FC", title: event.name, description },
    twitter: { card: "summary_large_image", title: event.name, description },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEvent(slug);
  if (!event) notFound();

  const cover = event.imageUrl && isAllowedImageUrl(event.imageUrl) ? event.imageUrl : null;
  const photos = (event.images || []).filter(isAllowedImageUrl);
  const viewerPhotos: LightboxPhoto[] = [
    ...(cover ? [{ src: cover, alt: event.name }] : []),
    ...photos.map((src, i) => ({ src, alt: `${event.name}, photo ${i + 1}` })),
  ];
  const paragraphs = (event.description || "").split(/\n+/).filter(Boolean);
  const url = `https://ekounitedfc.com/events/${event.slug}`;
  const meta = [formatEventDate(event.eventDate, { weekday: "long", day: "numeric", month: "long", year: "numeric" }), event.location]
    .filter(Boolean);

  return (
    <main>
      {cover && (
        <div data-reveal-skip className="relative aspect-[4/5] w-full overflow-hidden bg-navy-dark sm:aspect-[16/8]">
          <LightboxTrigger photos={viewerPhotos} index={0} label="Enlarge cover photo" className="absolute inset-0 h-full">
            <Image src={cover} alt={event.name} fill priority sizes="100vw" className="object-cover object-top" />
          </LightboxTrigger>
        </div>
      )}

      <article className="px-6 py-14 sm:px-10 sm:py-20 lg:px-16">
        <div className="mx-auto max-w-3xl">
          <Link href="/events" className="text-xs font-semibold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy">
            ← All events
          </Link>
          <h1 className="display-title font-display mt-5">{event.name}</h1>
          {meta.length > 0 && (
            <p className="mt-5 flex flex-wrap gap-x-4 gap-y-1 border-y border-navy/10 py-4 text-sm font-semibold uppercase tracking-wide text-navy/60">
              {meta.map((m) => (
                <span key={m}>{m}</span>
              ))}
            </p>
          )}

          {paragraphs.length > 0 && (
            <div className="mt-8 space-y-6 text-[1.0625rem] leading-[1.85] text-navy/80">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-navy/45">Share</span>
            <ShareLinks url={url} title={event.name} />
          </div>
        </div>

        {photos.length > 0 && (
          <div data-reveal-stagger="scale" className="mx-auto mt-14 grid max-w-5xl gap-3 sm:grid-cols-2">
            {photos.map((src, i) => (
              <div key={src} className={`relative aspect-[4/3] ${photos.length % 2 === 1 && i === 0 ? "sm:col-span-2 sm:aspect-[16/9]" : ""}`}>
                <LightboxTrigger
                  photos={viewerPhotos}
                  index={(cover ? 1 : 0) + i}
                  label={`Enlarge photo ${i + 1}`}
                  className="absolute inset-0 h-full"
                >
                  <FramedImage
                    src={src}
                    alt={`${event.name}, photo ${i + 1}`}
                    sizes="(min-width: 1024px) 40vw, (min-width: 640px) 45vw, 100vw"
                    fill
                  />
                </LightboxTrigger>
              </div>
            ))}
          </div>
        )}
      </article>
    </main>
  );
}
