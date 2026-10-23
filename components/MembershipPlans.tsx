"use client";

import { useRef, useState, type FormEvent } from "react";
import { clsx } from "clsx";
import { tiers, type TierId } from "@/lib/membership";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const fieldClass =
  "w-full border-b border-navy/20 bg-transparent px-1 py-3 text-sm text-navy outline-none transition-colors duration-200 ease-smooth placeholder:text-navy/30 focus:border-cyan";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-navy/50";

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="mt-1 h-4 w-4 shrink-0 text-cyan" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

// The four membership packages with their perks, and the application form
// underneath. Choosing a package on a card selects it in the form and scrolls
// down to it.
export default function MembershipPlans() {
  const [tier, setTier] = useState<TierId | "">("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  function choose(id: TierId) {
    setTier(id);
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!tier) {
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
          tier,
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

  const chosen = tiers.find((t) => t.id === tier);

  return (
    <>
      <div data-reveal-stagger className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {tiers.map((t) => {
          const selected = tier === t.id;
          return (
            <div
              key={t.id}
              className={clsx(
                "flex flex-col rounded-2xl p-6 transition-shadow duration-300 ease-smooth sm:p-7",
                selected ? "bg-navy-dark text-white shadow-[0_24px_50px_-24px_rgba(10,36,77,0.8)]" : "bg-navy/[0.04] text-navy"
              )}
            >
              <p className={clsx("text-[11px] font-semibold uppercase tracking-[0.25em]", selected ? "text-cyan" : "text-cyan")}>
                {t.audience}
              </p>
              <h3 className="mt-3 font-display text-3xl leading-none">{t.name}</h3>
              <p className="mt-5 font-display text-4xl leading-none">{t.price}</p>
              <p className={clsx("mt-1.5 text-xs font-semibold uppercase tracking-wide", selected ? "text-white/55" : "text-navy/45")}>
                {t.period || "membership fee"}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {t.perks.map((perk) => (
                  <li key={perk} className="flex gap-3 text-sm leading-relaxed">
                    <Check />
                    <span className={selected ? "text-white/85" : "text-navy/75"}>{perk}</span>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                onClick={() => choose(t.id)}
                className={clsx(
                  "btn-glass mt-8 w-full px-5 py-3 text-xs font-bold uppercase tracking-wide",
                  selected ? "btn-glass-light" : "btn-glass-navy"
                )}
              >
                {selected ? "Selected" : `Choose ${t.name}`}
              </button>
            </div>
          );
        })}
      </div>

      <div ref={formRef} id="join" className="mt-20 scroll-mt-28">
        <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,28rem)] lg:gap-16">
          <div data-reveal>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-cyan">Apply</p>
            <h2 className="display-title font-display">Join the club</h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-navy/70">
              Tell us who you are and which package you want. The club's marketing team will contact you to
              confirm your membership and arrange payment.
            </p>
          </div>

          {status === "sent" ? (
            <div data-reveal className="rounded-2xl bg-navy-dark p-8 text-white">
              <p className="font-display text-3xl">Thank you</p>
              <p className="mt-3 text-base leading-relaxed text-white/75">
                Your application for {chosen?.name} has been received. The Eko United marketing team will be in
                touch shortly.
              </p>
            </div>
          ) : (
            <form data-reveal onSubmit={handleSubmit} className="space-y-6">
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
                      key={t.id}
                      className={clsx(
                        "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm ring-1 transition-colors duration-200 ease-smooth",
                        tier === t.id ? "bg-navy text-white ring-navy" : "bg-white text-navy/80 ring-navy/15 hover:ring-navy/40"
                      )}
                    >
                      <input
                        type="radio"
                        name="tier"
                        value={t.id}
                        checked={tier === t.id}
                        onChange={() => setTier(t.id)}
                        className="sr-only"
                      />
                      <span className="flex-1 font-semibold">{t.name}</span>
                      <span className={clsx("text-xs", tier === t.id ? "text-white/60" : "text-navy/40")}>{t.price}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {error && (
                <p className="text-sm text-red-500" role="alert">
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
    </>
  );
}
