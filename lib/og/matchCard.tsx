import { readFileSync } from "fs";
import { join } from "path";

// Shared by app/tickets/[id]/opengraph-image.tsx and
// app/fixtures/[id]/opengraph-image.tsx — matches don't have their own
// photo, so a generated card with the actual fixture info (not just the
// generic site-wide branded fallback) is far more useful when shared.
export function getCrestDataUri(): string {
  const crest = readFileSync(join(process.cwd(), "public/brand/crest-mark.png"));
  return `data:image/png;base64,${crest.toString("base64")}`;
}

export function formatMatchDateForCard(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos",
  });
}

export function MatchCardImage({
  eyebrow,
  opponent,
  isHome,
  competition,
  venue,
  dateLabel,
}: {
  eyebrow: string;
  opponent: string;
  isHome: boolean;
  competition?: string;
  venue?: string;
  dateLabel: string;
}) {
  const home = isHome ? "Eko United" : opponent;
  const away = isHome ? opponent : "Eko United";
  const crestSrc = getCrestDataUri();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "80px",
        background: "#0A244D",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={crestSrc} width={56} height={56} alt="" />
        <div style={{ display: "flex", fontSize: 24, fontWeight: 600, color: "#65CBE9", letterSpacing: 3, textTransform: "uppercase" }}>
          {eyebrow}
        </div>
      </div>

      <div style={{ display: "flex", marginTop: 36, fontSize: 54, fontWeight: 700, color: "#FFFFFF", lineHeight: 1.15 }}>
        {home} vs {away}
      </div>

      <div style={{ display: "flex", marginTop: 24, fontSize: 28, color: "rgba(255,255,255,0.75)" }}>
        {competition || "Nigeria National League"}
      </div>
      <div style={{ display: "flex", marginTop: 10, fontSize: 26, color: "rgba(255,255,255,0.55)" }}>
        {dateLabel}
        {venue ? ` · ${venue}` : ""}
      </div>
    </div>
  );
}
