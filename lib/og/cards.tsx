import { ImageResponse } from "next/og";
import type { ReactNode } from "react";
import { CARD, COLORS, cardPhoto, crestUri, fitText, ogFonts } from "@/lib/og/brand";
import { sections, type SectionKey } from "@/lib/seo";
import { sortSquad } from "@/lib/squad";
import type { DemoPlayer } from "@/lib/demoData";

// The share cards (1200x630, the size X, WhatsApp, Facebook and LinkedIn all
// expect) for every kind of page. Built on one frame so the whole site reads
// as one brand when links are passed around: navy field, the crest, Bebas
// Neue headlines, a cyan diagonal. Photos are fetched here and inlined so a
// slow or missing photo never breaks the card.

function render(tree: ReactNode) {
  return new ImageResponse(tree as React.ReactElement, { ...CARD, fonts: ogFonts() });
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        width: CARD.width,
        height: CARD.height,
        display: "flex",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${COLORS.navy} 0%, ${COLORS.navyDark} 100%)`,
        fontFamily: "Work",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -240,
          left: 640,
          width: 150,
          height: 1200,
          display: "flex",
          background: "rgba(101,203,233,0.09)",
          transform: "rotate(24deg)",
        }}
      />
      {children}
    </div>
  );
}

function Brand() {
  return (
    <div style={{ position: "absolute", top: 44, left: 64, display: "flex", alignItems: "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crestUri()} width={56} height={56} alt="" />
      <div style={{ display: "flex", marginLeft: 16, fontFamily: "Bebas", fontSize: 36, letterSpacing: 2, color: COLORS.white }}>
        EKO UNITED FC
      </div>
    </div>
  );
}

function Url() {
  return (
    <div style={{ position: "absolute", bottom: 40, left: 64, display: "flex", fontSize: 22, fontWeight: 600, letterSpacing: 1, color: "rgba(255,255,255,0.55)" }}>
      ekounitedfc.com
    </div>
  );
}

function headlineSize(text: string, base: number): number {
  const n = text.length;
  if (n <= 12) return Math.round(base * 0.94);
  if (n <= 18) return Math.round(base * 0.75);
  if (n <= 26) return Math.round(base * 0.6);
  return Math.round(base * 0.48);
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", fontSize: 26, fontWeight: 600, letterSpacing: 6, textTransform: "uppercase", color: COLORS.cyan }}>
      {children}
    </div>
  );
}

function TextBlock({ eyebrow, headline, subline, width = 620 }: { eyebrow: string; headline: string; subline?: string; width?: number }) {
  return (
    <div style={{ position: "absolute", left: 64, bottom: 100, width, display: "flex", flexDirection: "column" }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <div
        style={{
          display: "flex",
          marginTop: 16,
          fontFamily: "Bebas",
          fontSize: headlineSize(headline, 160),
          lineHeight: 0.95,
          letterSpacing: 1,
          textTransform: "uppercase",
          color: COLORS.white,
        }}
      >
        {headline}
      </div>
      <div style={{ display: "flex", width: 90, height: 8, marginTop: 28, background: COLORS.yellow }} />
      {subline && (
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: "rgba(255,255,255,0.78)" }}>{subline}</div>
      )}
    </div>
  );
}

function CrestMark() {
  return (
    <div style={{ position: "absolute", top: 0, right: 0, width: 520, height: CARD.height, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", width: 440, height: 440, borderRadius: 220, display: "flex", background: "rgba(101,203,233,0.12)" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={crestUri()} width={330} height={330} alt="" />
    </div>
  );
}

// A plain section page (fixtures, shop, contact...): branded headline beside the crest.
export function sectionCard(key: SectionKey) {
  const s = sections[key];
  return render(
    <Frame>
      <Brand />
      <CrestMark />
      <TextBlock eyebrow={s.eyebrow} headline={s.headline} subline={s.subline} />
      <Url />
    </Frame>
  );
}

// A story with a photo behind it: news article, event, or a section led by its latest photo.
export async function storyCard({
  photo,
  eyebrow,
  title,
  meta,
  fallbackKey,
}: {
  photo?: string | null;
  eyebrow: string;
  title: string;
  meta?: string;
  fallbackKey?: SectionKey;
}) {
  const img = await cardPhoto(photo, 1200, 630);
  if (!img) {
    if (fallbackKey) return sectionCard(fallbackKey);
    return render(
      <Frame>
        <Brand />
        <CrestMark />
        <TextBlock eyebrow={eyebrow} headline={fitText(title, 40)} subline={meta} />
        <Url />
      </Frame>
    );
  }

  const heading = fitText(title, 84);
  return render(
    <Frame>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img} width={CARD.width} height={CARD.height} alt="" style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          background: "linear-gradient(to top, rgba(6,23,51,0.97) 0%, rgba(6,23,51,0.9) 34%, rgba(6,23,51,0.5) 62%, rgba(6,23,51,0.15) 84%, rgba(6,23,51,0.4) 100%)",
        }}
      />
      <Brand />
      <div style={{ position: "absolute", left: 64, right: 64, bottom: 50, display: "flex", flexDirection: "column" }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <div
          style={{
            display: "flex",
            marginTop: 14,
            fontFamily: "Bebas",
            fontSize: heading.length > 56 ? 78 : 96,
            lineHeight: 0.98,
            letterSpacing: 1,
            textTransform: "uppercase",
            color: COLORS.white,
          }}
        >
          {heading}
        </div>
        <div style={{ display: "flex", alignItems: "center", marginTop: 22 }}>
          <div style={{ display: "flex", width: 70, height: 7, background: COLORS.yellow }} />
          <div style={{ display: "flex", marginLeft: 22, fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
            {meta || "ekounitedfc.com"}
          </div>
        </div>
      </div>
    </Frame>
  );
}

// A section led by the photos that are actually on that page: the headline
// beside a row of up to three of them. One photo becomes a full-bleed story
// card; none falls back to the plain branded section card.
export async function collageCard(
  key: SectionKey,
  items: { url?: string | null; cutout?: boolean }[],
  subline?: string
) {
  const s = sections[key];
  const photos = (
    await Promise.all(items.slice(0, 3).map((it) => cardPhoto(it.url, 340, 880)))
  ).filter((p): p is string => Boolean(p));
  if (photos.length === 0) return sectionCard(key);
  if (photos.length === 1) {
    return storyCard({ photo: items.find((it) => it.url)?.url, eyebrow: s.eyebrow, title: s.headline, meta: subline || s.subline, fallbackKey: key });
  }

  const tops = [70, 24, 94];
  return render(
    <Frame>
      <Brand />
      <TextBlock eyebrow={s.eyebrow} headline={s.headline} subline={subline || s.subline} width={520} />
      <div style={{ position: "absolute", top: 0, right: 56, height: CARD.height, display: "flex" }}>
        {photos.map((src, i) => (
          <div
            key={i}
            style={{
              position: "relative",
              display: "flex",
              width: photos.length === 2 ? 200 : 170,
              height: 440,
              marginTop: tops[i],
              marginLeft: i === 0 ? 0 : 16,
              borderRadius: 18,
              overflow: "hidden",
              background: "linear-gradient(170deg, #65CBE9 0%, #1b5f8f 60%, #0A244D 100%)",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} width={photos.length === 2 ? 200 : 170} height={440} alt="" style={{ objectFit: "cover", objectPosition: "50% 0%" }} />
          </div>
        ))}
      </div>
      <Url />
    </Frame>
  );
}

// The squad page: three real player photos spread across the squad.
export async function squadCard(players: DemoPlayer[]) {
  const withPhotos = sortSquad(players).filter((p) => p.photoUrl);
  const picks =
    withPhotos.length <= 3
      ? withPhotos
      : [0, Math.floor(withPhotos.length / 2), withPhotos.length - 1].map((i) => withPhotos[i]);
  return collageCard(
    "team",
    picks.map((p) => ({ url: p.photoUrl, cutout: p.photoCutout })),
    `${players.length} player${players.length === 1 ? "" : "s"} | ${sections.team.subline}`
  );
}

// One player: photo on the right over a cyan panel, name and number on the left.
export async function playerCard(player: DemoPlayer) {
  const photo = await cardPhoto(player.photoUrl, 500, 630);
  const name = fitText(player.name, 34).toUpperCase();
  const isPlayer = player.role === "player";
  const eyebrow = isPlayer ? player.position || "First Team" : player.title || player.position || "Eko United FC";
  const stats = [
    { label: "Apps", value: player.stats?.appearances ?? 0 },
    { label: "Goals", value: player.stats?.goals ?? 0 },
    { label: "Assists", value: player.stats?.assists ?? 0 },
  ];
  const hasNumber = typeof player.squadNumber === "number";

  return render(
    <Frame>
      {hasNumber && (
        <div
          style={{
            position: "absolute",
            left: 330,
            top: 40,
            display: "flex",
            fontFamily: "Bebas",
            fontSize: 560,
            lineHeight: 1,
            color: "rgba(255,255,255,0.05)",
          }}
        >
          {String(player.squadNumber)}
        </div>
      )}

      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 500,
          height: CARD.height,
          display: "flex",
          background: "linear-gradient(165deg, #65CBE9 0%, #2a7fae 50%, #0A244D 100%)",
        }}
      >
        {photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} width={500} height={CARD.height} alt="" style={{ objectFit: "cover", objectPosition: "50% 0%" }} />
        ) : (
          <div style={{ display: "flex", width: 500, height: CARD.height, alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={crestUri()} width={260} height={260} alt="" />
          </div>
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 120,
            height: CARD.height,
            display: "flex",
            background: "linear-gradient(to right, rgba(10,36,77,0.85), rgba(10,36,77,0))",
          }}
        />
      </div>

      <Brand />

      <div style={{ position: "absolute", left: 64, bottom: isPlayer ? 150 : 110, width: 660, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {hasNumber && (
            <div style={{ display: "flex", marginRight: 18, fontFamily: "Bebas", fontSize: 64, lineHeight: 1, color: COLORS.cyan }}>
              {String(player.squadNumber)}
            </div>
          )}
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 12,
            fontFamily: "Bebas",
            fontSize: name.length <= 14 ? 128 : name.length <= 20 ? 104 : 84,
            lineHeight: 0.95,
            letterSpacing: 1,
            color: COLORS.white,
          }}
        >
          {name}
        </div>
        <div style={{ display: "flex", width: 90, height: 8, marginTop: 26, background: COLORS.yellow }} />
      </div>

      {isPlayer && (
        <div style={{ position: "absolute", left: 64, bottom: 44, display: "flex" }}>
          {stats.map((s, i) => (
            <div key={s.label} style={{ display: "flex", flexDirection: "column", marginRight: i === stats.length - 1 ? 0 : 44 }}>
              <div style={{ display: "flex", fontFamily: "Bebas", fontSize: 52, lineHeight: 1, color: COLORS.white }}>{String(s.value)}</div>
              <div style={{ display: "flex", marginTop: 4, fontSize: 18, fontWeight: 600, letterSpacing: 3, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      )}
      {!isPlayer && <Url />}
    </Frame>
  );
}
