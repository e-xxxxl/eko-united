import { ImageResponse } from "next/og";
import { apiFetch } from "@/lib/api";
import type { DemoMatch } from "@/lib/demoData";
import { MatchCardImage, formatMatchDateForCard } from "@/lib/og/matchCard";

export const alt = "Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

async function getMatch(id: string): Promise<DemoMatch | null> {
  return await apiFetch<DemoMatch>(`/matches/${id}`, 300);
}

export default async function OpengraphImage({ params }: { params: { id: string } }) {
  const match = await getMatch(params.id);
  if (!match) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0A244D" }} />,
      { ...size }
    );
  }

  return new ImageResponse(
    (
      <MatchCardImage
        eyebrow={match.status === "finished" ? "Full Time" : "Fixture"}
        opponent={match.opponent}
        isHome={match.isHome}
        competition={match.competition}
        venue={match.venue}
        dateLabel={formatMatchDateForCard(match.kickoff)}
      />
    ),
    { ...size }
  );
}
