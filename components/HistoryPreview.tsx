import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";

const demoHistory =
  "Eko United FC — The Uga Boys — represent Lagos in the Nigeria National League. Founded on ambition and community pride, the club is building a modern footballing institution for the city, one campaign at a time.";

// Demo stadium photo — swap for a real club/founding photo once supplied.
const demoImage = "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=900&q=80&fit=crop&auto=format";

async function getHistory(): Promise<string> {
  const settings = await apiFetch<{ clubInfo?: { history?: string } }>("/settings");
  return settings?.clubInfo?.history || demoHistory;
}

export default async function HistoryPreview() {
  const history = await getHistory();
  const excerpt = history.length > 280 ? history.slice(0, 280).trim() + "…" : history;

  return (
    <section className="grid gap-10 px-6 py-16 sm:px-10 lg:grid-cols-[2fr_3fr] lg:items-center lg:px-16">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-light">
        <Image
          src={demoImage}
          alt="Eko United FC history"
          fill
          sizes="(min-width: 1024px) 38vw, 90vw"
          className="object-cover"
        />
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Since 2026
        </p>
        <h2 className="font-display text-2xl text-navy sm:text-3xl">Our History</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy/70">{excerpt}</p>
        <Link
          href="/club-history"
          className="mt-4 inline-block text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
        >
          Read the full story →
        </Link>
      </div>
    </section>
  );
}
