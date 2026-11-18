import Image from "next/image";
import { isAllowedImageUrl } from "@/lib/imageHosts";

// The top of the gallery: a bold two-line title with the second line outlined,
// the counts, and the three latest photos fanned out at slight angles.
export default function GalleryHero({ photos, photoCount, videoCount }: { photos: string[]; photoCount: number; videoCount: number }) {
  const shots = photos.filter(isAllowedImageUrl).slice(0, 3);
  const [a, b, c] = shots;

  return (
    <section data-reveal-skip className="relative mb-14 grid items-center gap-12 overflow-hidden lg:mb-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-8">
      <div>
        <p className="mb-5 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Matchday &amp; behind the scenes</p>
        <h1 className="font-display text-[4.2rem] uppercase leading-[0.86] text-navy sm:text-[6.5rem] lg:text-[8rem]">
          The Uga
          <br />
          <span className="text-transparent [-webkit-text-stroke:2px_#0A244D]">Boys</span>
          <span className="text-cyan"> in frame</span>
        </h1>
        <p className="mt-7 max-w-md text-base leading-relaxed text-navy/65 sm:text-lg">Matchday moments, training sessions and everything in between, as the club sees it.</p>
        <p className="mt-6 flex flex-wrap gap-3">
          <span className="rounded-full bg-navy px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white">
            <span className="mr-1.5 font-display text-base tracking-normal text-cyan">{photoCount}</span> photos
          </span>
          {videoCount > 0 && (
            <span className="rounded-full bg-navy/[0.07] px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-navy/70">
              <span className="mr-1.5 font-display text-base tracking-normal text-navy">{videoCount}</span> videos
            </span>
          )}
        </p>
      </div>

      {a && (
        <div aria-hidden className="relative mx-auto hidden h-[26rem] w-full max-w-xl sm:block lg:h-[32rem]">
          <span className="absolute left-2 top-10 h-3/5 w-3/5 rounded-[2.5rem] bg-cyan/25" />
          <span className="absolute bottom-2 right-0 h-2/5 w-2/5 rounded-[2rem] bg-navy/[0.07]" />
          <div className="absolute left-0 top-6 aspect-[3/4] w-[52%] -rotate-3 overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(6,23,51,0.55)]">
            <Image src={a} alt="" fill priority sizes="(min-width: 1024px) 24vw, 40vw" className="object-cover" />
          </div>
          {b && (
            <div className="absolute right-0 top-0 aspect-[4/5] w-[44%] rotate-[4deg] overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(6,23,51,0.55)]">
              <Image src={b} alt="" fill sizes="(min-width: 1024px) 20vw, 35vw" className="object-cover" />
            </div>
          )}
          {c && (
            <div className="absolute bottom-0 right-[12%] aspect-square w-[36%] -rotate-2 overflow-hidden rounded-3xl shadow-[0_30px_60px_-20px_rgba(6,23,51,0.55)]">
              <Image src={c} alt="" fill sizes="(min-width: 1024px) 16vw, 30vw" className="object-cover" />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
