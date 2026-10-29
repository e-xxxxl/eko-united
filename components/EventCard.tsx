import Link from "next/link";
import FramedImage from "@/components/FramedImage";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import { CSR_LABEL, formatEventDate, type ClubEvent } from "@/lib/eventTypes";

function DateChip({ iso }: { iso: string }) {
  const day = formatEventDate(iso, { day: "numeric" });
  const month = formatEventDate(iso, { month: "short" });
  return (
    <span className="absolute left-3 top-3 flex min-w-[3.25rem] flex-col items-center rounded-lg bg-white px-2.5 py-1.5 text-navy-dark shadow-sm">
      <span className="font-display text-2xl leading-none">{day}</span>
      <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide">{month}</span>
    </span>
  );
}

// An event as a card: the photo is the card, with the date pinned to its
// corner and the name, place and a short line of detail beneath.
export default function EventCard({ event, muted = false }: { event: ClubEvent; muted?: boolean }) {
  const hasImage = event.imageUrl && isAllowedImageUrl(event.imageUrl);
  return (
    <Link href={`/events/${event.slug}`} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-navy-dark">
        {hasImage ? (
          <FramedImage
            src={event.imageUrl as string}
            alt={event.name}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
            fill
            rounded={false}
            className={`transition-transform duration-700 ease-smooth group-hover:scale-105 ${muted ? "grayscale-[35%]" : ""}`}
          />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(160deg,#123568,#071a38)]" />
        )}
        {event.eventDate && <DateChip iso={event.eventDate} />}
        {event.isCsr && (
          <span className="absolute right-3 top-3 max-w-[60%] rounded-lg bg-navy-dark/90 px-2.5 py-1.5 text-[10px] font-bold uppercase leading-tight tracking-wide text-white backdrop-blur-sm">
            <span className="text-cyan">CSR</span> <span className="hidden sm:inline">{CSR_LABEL}</span>
          </span>
        )}
      </div>
      <p className="mt-4 line-clamp-2 font-display text-2xl leading-tight text-navy transition-colors duration-200 ease-smooth group-hover:text-cyan">
        {event.name}
      </p>
      {event.location && <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-navy/45">{event.location}</p>}
      {event.description && <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-navy/60">{event.description}</p>}
    </Link>
  );
}
