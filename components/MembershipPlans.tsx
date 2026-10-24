"use client";

import { useRef, useState, type FormEvent } from "react";
import Image from "next/image";
import { clsx } from "clsx";
import FramedImage from "@/components/FramedImage";
import { isAllowedImageUrl } from "@/lib/imageHosts";
import type { MembershipTier } from "@/lib/membershipTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
const PREVIEW_PERKS = 4;

const fieldClass =
  "w-full border-b border-white/25 bg-transparent px-1 py-3 text-sm text-white outline-none transition-colors duration-200 ease-smooth placeholder:text-white/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-white/55";

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// Used when a package has no photo yet: the crest on a navy field, so a card
// is never an empty box.
function CrestFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(70%_80%_at_50%_0%,rgba(101,203,233,0.28),transparent_70%),linear-gradient(160deg,#123568,#071a38)]">
      <Image src="/brand/crest-mark.png" alt="" width={96} height={96} className="h-24 w-24 opacity-30" />
    </div>
  );
}

function TierCard({
  tier,
  selected,
  onChoose,
}: {
  tier: MembershipTier;
  selected: boolean;
  onChoose: () => void;
}) {
  const [open, setOpen] = useState(false);
  const hasImage = tier.imageUrl && isAllowedImageUrl(tier.imageUrl);
  const extra = Math.max(0, tier.perks.length - PREVIEW_PERKS);

  return (
    <article
      className={clsx(
        "group flex flex-col overflow-hidden rounded-2xl bg-white ring-1 transition-all duration-500 ease-smooth hover:-translate-y-1.5",
        selected
          ? "shadow-[0_30px_60px_-28px_rgba(10,36,77,0.75)] ring-2 ring-navy"
          : "shadow-[0_18px_40px_-30px_rgba(10,36,77,0.6)] ring-navy/10 hover:shadow-[0_30px_60px_-28px_rgba(10,36,77,0.6)]"
      )}
    >
      <div className="relative aspect-[16/11] overflow-hidden bg-navy-dark">
        {hasImage ? (
          <FramedImage
            src={tier.imageUrl as string}
            alt={tier.name}
            sizes="(min-width: 1280px) 25vw, (min-width: 768px) 45vw, 100vw"
            fill
            rounded={false}
            className="transition-transform duration-[900ms] ease-smooth group-hover:scale-105"
          />
        ) : (
          <CrestFallback />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark/90 via-navy-dark/20 to-transparent" />
        {tier.badge && (
          <span className="absolute left-4 top-4 rounded-md bg-white/15 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white ring-1 ring-white/35 backdrop-blur-md">
            {tier.badge}
          </span>
        )}
        <div className="absolute inset-x-0 bottom-0 p-5">
          {tier.audience && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan">{tier.audience}</p>
          )}
          <h3 className="mt-1 font-display text-3xl leading-none text-white">{tier.name}</h3>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="font-display text-4xl leading-none text-navy">{tier.price}</p>
        <p className="mt-1.5 text-xs font-semibold uppercase tracking-wide text-navy/45">
          {tier.period || "membership fee"}
        </p>
        {tier.tagline && <p className="mt-4 text-sm leading-relaxed text-navy/65">{tier.tagline}</p>}

        <ul className="mt-5 space-y-3">
          {tier.perks.slice(0, PREVIEW_PERKS).map((perk) => (
            <li key={perk} className="flex gap-3 text-sm leading-relaxed text-navy/80">
              <Check />
              <span>{perk}</span>
            </li>
          ))}
        </ul>

        {extra > 0 && (
          <>
            <div
              className={clsx(
                "grid transition-[grid-template-rows,opacity] duration-500 ease-smooth",
                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              )}
            >
              <ul className="space-y-3 overflow-hidden">
                {tier.perks.slice(PREVIEW_PERKS).map((perk, i) => (
                  <li key={perk} className={clsx("flex gap-3 text-sm leading-relaxed text-navy/80", i === 0 && "mt-3")}>
                    <Check />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              className="mt-4 self-start text-xs font-bold uppercase tracking-wide text-cyan transition-colors duration-200 ease-smooth hover:text-navy"
            >
              {open ? "Show fewer perks" : `See all ${tier.perks.length} perks`}
            </button>
          </>
        )}

        <div className="mt-auto pt-7">
          <button
            type="button"
            onClick={onChoose}
            className="btn-glass btn-glass-yellow w-full px-5 py-3 text-xs font-bold uppercase tracking-wide"
          >
            {selected ? "Selected, complete the form" : "Apply for this package"}
          </button>
        </div>
      </div>
    </article>
  );
}

// The packages (as image cards that expand to show every perk) and the
// application form. Choosing a package selects it in the form, which shows a
// live summary of the choice, and scrolls down to it.
export default function MembershipPlans({ tiers }: { tiers: MembershipTier[] }) {
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const chosen = tiers.find((t) => t.slug === slug);

  function choose(next: string) {
    setSlug(next);
    setError("");
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!chosen) {
      setError("Please choose the package you want.");
      return;
    }
    setStatus("submitting");
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const res = await fetch(`${API_URL}/membership`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(data.get("name") || ""),
          email: String(data.get("email") || ""),
          phone: String(data.get("phone") || ""),
          tier: chosen.slug,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(body.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setError("Can't reach the server right now. Please try again.");
      setStatus("error");
    }
  }

  return (
    <>
      <div id="packages" className="scroll-mt-28">
        <p data-reveal className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">
          Packages
        </p>
        <h2 data-reveal className="display-title font-display mb-10">
          Choose your package
        </h2>
        <div data-reveal-stagger className="grid items-stretch gap-6 md:grid-cols-2 xl:grid-cols-4">
          {tiers.map((t) => (
            <TierCard key={t.slug} tier={t} selected={slug === t.slug} onChoose={() => choose(t.slug)} />
          ))}
        </div>
      </div>

      <div ref={formRef} id="join" className="mt-24 scroll-mt-28">
        <div data-reveal className="grid overflow-hidden rounded-3xl bg-navy-dark text-white lg:grid-cols-[1.05fr_1fr]">
          <div className="relative min-h-[18rem] overflow-hidden">
            {chosen?.imageUrl && isAllowedImageUrl(chosen.imageUrl) ? (
              <FramedImage
                key={chosen.slug}
                src={chosen.imageUrl}
                alt={chosen.name}
                sizes="(min-width: 1024px) 45vw, 100vw"
                fill
                rounded={false}
              />
            ) : (
              <CrestFallback />
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-dark via-navy-dark/55 to-navy-dark/20" />
            <div className="relative flex h-full min-h-[18rem] flex-col justify-end p-7 sm:p-10">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Apply</p>
              <h2 className="display-title mt-3 font-display">{chosen ? chosen.name : "Join the club"}</h2>
              {chosen ? (
                <p className="mt-3 font-display text-3xl text-white/90">
                  {chosen.price}
                  <span className="ml-3 text-sm font-sans uppercase tracking-wide text-white/55">
                    {chosen.period || "membership fee"}
                  </span>
                </p>
              ) : (
                <p className="mt-3 max-w-sm text-base leading-relaxed text-white/70">
                  Pick a package above, or choose one in the form, and tell us how to reach you.
                </p>
              )}
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
                The club's marketing team will contact you to confirm your membership and arrange payment.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            {status === "sent" ? (
              <div className="flex h-full flex-col justify-center">
                <p className="font-display text-4xl">Thank you</p>
                <p className="mt-4 text-base leading-relaxed text-white/75">
                  Your application for {chosen?.name} has been received. The Eko United marketing team will be in
                  touch shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className={labelClass}>
                    Full name
                  </label>
                  <input id="name" name="name" required autoComplete="name" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email
                  </label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={fieldClass} />
                </div>
                <div>
                  <label htmlFor="phone" className={labelClass}>
                    Phone number
                  </label>
                  <input id="phone" name="phone" type="tel" required autoComplete="tel" className={fieldClass} />
                </div>

                <fieldset>
                  <legend className={labelClass}>Package</legend>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tiers.map((t) => (
                      <label
                        key={t.slug}
                        className={clsx(
                          "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 transition-colors duration-200 ease-smooth",
                          slug === t.slug
                            ? "bg-white text-navy-dark ring-white"
                            : "bg-white/[0.04] text-white/80 ring-white/15 hover:ring-white/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="tier"
                          value={t.slug}
                          checked={slug === t.slug}
                          onChange={() => setSlug(t.slug)}
                          className="sr-only"
                        />
                        <span className="flex-1 font-semibold">{t.name}</span>
                        <span className={clsx("text-xs", slug === t.slug ? "text-navy/50" : "text-white/40")}>
                          {t.price}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>

                {error && (
                  <p className="text-sm text-red-300" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="btn-glass btn-glass-yellow px-8 py-3.5 text-sm font-bold uppercase tracking-wide disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending…" : "Submit application"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
