import Link from "next/link";
import { apiFetch } from "@/lib/api";

async function getHistory(): Promise<string | null> {
  const settings = await apiFetch<{ clubInfo?: { history?: string } }>("/settings");
  return settings?.clubInfo?.history || null;
}

// No fallback text/photo here on purpose — a fabricated history paragraph
// would misrepresent the club as fact. Hides entirely until the admin has
// entered real history copy via Settings.
export default async function HistoryPreview() {
  const history = await getHistory();
  if (!history) return null;

  const excerpt = history.length > 280 ? history.slice(0, 280).trim() + "…" : history;

  return (
    <section className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Since 2026</p>
      <h2 className="font-display text-2xl text-navy sm:text-3xl">Our History</h2>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-navy/70">{excerpt}</p>
      <Link
        href="/club-history"
        className="mt-4 inline-block text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
      >
        Read the full story →
      </Link>
    </section>
  );
}
