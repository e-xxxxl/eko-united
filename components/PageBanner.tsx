import type { ReactNode } from "react";

// The header band for list pages that would otherwise open with a bare title:
// navy, with the diagonal pattern the club uses, a ghosted word behind, the
// title, a line of context and a row of figures (`children`).
export default function PageBanner({
  eyebrow,
  title,
  ghost,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  ghost?: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <section data-reveal-skip className="relative mb-12 overflow-hidden rounded-3xl bg-navy-dark px-6 py-10 text-white sm:px-10 sm:py-14">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_90%_at_95%_0%,rgba(101,203,233,0.25),transparent_70%),repeating-linear-gradient(115deg,transparent_0_46px,rgba(255,255,255,0.03)_46px_47px)]"
      />
      {ghost && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-6 right-4 select-none font-display text-[7rem] uppercase leading-none text-white/[0.05] sm:-bottom-10 sm:text-[12rem]"
        >
          {ghost}
        </span>
      )}
      <div className="relative">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>
        <h1 className="font-display text-6xl uppercase leading-[0.9] sm:text-8xl">{title}</h1>
        {intro && <p className="mt-5 max-w-xl text-base leading-relaxed text-white/65">{intro}</p>}
        {children && <div className="mt-8 flex flex-wrap gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function BannerStat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="min-w-[5.5rem] rounded-xl bg-white/[0.07] px-4 py-3 text-center ring-1 ring-white/10">
      <p className="font-display text-3xl leading-none text-white">{value}</p>
      <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/50">{label}</p>
    </div>
  );
}
