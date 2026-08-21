import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "@/lib/api";
import { demoManagement, type DemoPlayer } from "@/lib/demoData";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Eko United FC — club history, vision & mission, stadium information, and the management team behind The Uga Boys.",
};

type SiteSettings = {
  clubInfo?: {
    history?: string;
    vision?: string;
    mission?: string;
    stadiumInfo?: string;
    address?: string;
  };
};

async function getSettings(): Promise<SiteSettings> {
  return (await apiFetch<SiteSettings>("/settings")) || {};
}

async function getManagementTeam(): Promise<DemoPlayer[]> {
  const live = await apiFetch<DemoPlayer[]>("/players?role=management");
  return live && live.length > 0 ? live : demoManagement;
}

export default async function AboutPage() {
  const [settings, management] = await Promise.all([getSettings(), getManagementTeam()]);
  const clubInfo = settings.clubInfo || {};

  return (
    <main className="px-6 py-16 sm:px-10 lg:px-16">
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
        The Club
      </p>
      <h1 className="display-title font-display max-w-2xl">About Eko United FC</h1>

      {/* HISTORY — summary only, full timeline lives at /club-history */}
      <section className="mt-14 grid gap-8 border-t border-navy/10 pt-10 lg:grid-cols-3">
        <h2 className="font-display text-2xl text-navy/90">Our Story</h2>
        <div className="lg:col-span-2">
          <p className="max-w-2xl text-base leading-relaxed text-navy/70">
            {clubInfo.history ||
              "Eko United FC — The Uga Boys — represent Lagos in the Nigeria National League. Founded on ambition and community pride, the club is building a modern footballing institution for the city."}
          </p>
          <Link
            href="/club-history"
            className="mt-4 inline-block text-sm font-semibold text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
          >
            See the full club history →
          </Link>
        </div>
      </section>

      {/* VISION & MISSION — one navy-filled cell, one white cell with a rule,
          not two identical bordered boxes */}
      <section className="mt-14 grid border-t border-navy/10 pt-10 sm:grid-cols-2">
        <div className="bg-navy-dark p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan">Vision</p>
          <p className="mt-4 text-base leading-relaxed text-white/85">
            {clubInfo.vision ||
              "To be the most competitive and beloved football club in Lagos, respected across the Nigeria National League and beyond."}
          </p>
        </div>
        <div className="border-l-2 border-cyan p-8 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-navy/40">
            Mission
          </p>
          <p className="mt-4 text-base leading-relaxed text-navy/80">
            {clubInfo.mission ||
              "To develop homegrown talent, compete with integrity, and give the people of Lagos a club they're proud to call their own."}
          </p>
        </div>
      </section>

      {/* STADIUM INFO */}
      <section className="mt-14 grid gap-8 border-t border-navy/10 pt-10 lg:grid-cols-3">
        <h2 className="font-display text-2xl text-navy/90">Our Stadium</h2>
        <div className="lg:col-span-2">
          <p className="max-w-2xl text-base leading-relaxed text-navy/70">
            {clubInfo.stadiumInfo ||
              "Eko United FC play home matches at Agege Stadium, Lagos — details on capacity, facilities and matchday access will be published here."}
          </p>
          {clubInfo.address && (
            <p className="mt-3 text-sm text-navy/50">{clubInfo.address}</p>
          )}
        </div>
      </section>

      {/* MANAGEMENT TEAM */}
      <section className="mt-14 border-t border-navy/10 pt-10">
        <h2 className="font-display text-2xl text-navy/90">Management Team</h2>

        {management.length === 0 ? (
          <p className="mt-6 text-navy/50">
            Management team profiles will appear here once added by the club.
          </p>
        ) : (
          <div className="mt-8 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {management.map((person) => (
              <div key={person._id}>
                <div className="relative aspect-square overflow-hidden bg-navy-light">
                  {person.photoUrl ? (
                    <Image
                      src={person.photoUrl}
                      alt={person.name}
                      fill
                      sizes="(min-width: 1024px) 22vw, (min-width: 640px) 40vw, 80vw"
                      className="object-cover"
                    />
                  ) : null}
                </div>
                <p className="mt-4 font-display text-lg">{person.name}</p>
                {person.title && <p className="text-sm text-cyan">{person.title}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
