import Image from "next/image";
import { apiFetch } from "@/lib/api";
import SafeImage from "@/components/SafeImage";

// Demo stadium-lights photo — swap for a real matchday/squad photo once supplied.
const closingBg = "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1600&q=80&fit=crop&auto=format";

type Sponsor = { _id: string; name: string; logoUrl: string };

async function getSponsors(): Promise<Sponsor[]> {
  return (await apiFetch<Sponsor[]>("/sponsors", 3600)) || [];
}

export default async function PartnersSlogan() {
  const sponsors = await getSponsors();

  return (
    <>
      <section className="border-t border-navy/10 px-6 py-14 sm:px-10 lg:px-16">
        <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.3em] text-navy/40">
          Club Partners
        </p>
        {sponsors.length === 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-8 w-24 rounded-sm bg-navy/10" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-10">
            {sponsors.map((sponsor) => (
              <SafeImage
                key={sponsor._id}
                src={sponsor.logoUrl}
                alt={sponsor.name}
                width={120}
                height={40}
                className="h-8 w-auto object-contain opacity-70 grayscale transition-all duration-300 ease-smooth hover:opacity-100 hover:grayscale-0"
              />
            ))}
          </div>
        )}
      </section>

      {/* Closing brand moment — the crest and slogan, large, before the footer */}
      <section className="relative flex flex-col items-center gap-4 overflow-hidden px-6 py-20 text-center sm:px-10 lg:px-16">
        <Image src={closingBg} alt="" fill sizes="100vw" className="object-cover" />
        <div className="pointer-events-none absolute inset-0 bg-navy-dark/80" />
        <Image
          src="/brand/crest-mark.png"
          alt="Eko United FC crest"
          width={64}
          height={64}
          className="relative h-16 w-16"
        />
        <p className="font-display relative text-4xl text-white sm:text-6xl">The Uga Boys</p>
      </section>
    </>
  );
}
