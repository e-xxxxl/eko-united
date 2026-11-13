"use client";

import { clsx } from "clsx";
import type { ReactNode } from "react";

// Small building blocks shared by the ticketing and shop admin screens, so the
// numbers read the same everywhere.

export function PageHeader({
  eyebrow,
  title,
  intro,
  actions,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan">{eyebrow}</p>
        <h1 className="display-title font-display mt-2">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-navy/50">{intro}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "good" | "warn";
}) {
  return (
    <div
      className={clsx(
        "rounded-2xl p-5",
        tone === "good" ? "bg-cyan/15" : tone === "warn" ? "bg-yellow/20" : "bg-navy/[0.04]"
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-navy/50">{label}</p>
      <p className="mt-2 font-display text-4xl leading-none text-navy">{value}</p>
      {sub && <p className="mt-2 text-xs leading-snug text-navy/50">{sub}</p>}
    </div>
  );
}

// A thin bar showing how full something is.
export function ProgressBar({ value, max, className }: { value: number; max: number; className?: string }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={clsx("h-2 w-full overflow-hidden rounded-full bg-navy/10", className)} role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={clsx("h-full rounded-full", pct >= 100 ? "bg-navy" : "bg-cyan")} style={{ width: `${pct}%` }} />
    </div>
  );
}

const pillTone = {
  good: "bg-cyan/20 text-navy",
  warn: "bg-yellow/25 text-navy",
  bad: "bg-red-100 text-red-600",
  neutral: "bg-navy/10 text-navy/60",
  dark: "bg-navy text-white",
} as const;

export function Pill({ tone = "neutral", children }: { tone?: keyof typeof pillTone; children: ReactNode }) {
  return (
    <span className={clsx("inline-block whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide", pillTone[tone])}>
      {children}
    </span>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-navy/15 px-6 py-10 text-center text-sm text-navy/50">{children}</p>;
}

export function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-sm text-red-500" role="alert">
      {children}
    </p>
  );
}

export const btnPrimary = "btn-glass btn-glass-yellow px-6 py-2.5 text-xs font-bold uppercase tracking-wide";
export const btnSecondary = "btn-glass btn-glass-navy px-6 py-2.5 text-xs font-bold uppercase tracking-wide";

export function kickoffLabel(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "Africa/Lagos" });
}

export function timeLabel(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}

export function dateTimeLabel(iso?: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" });
}
