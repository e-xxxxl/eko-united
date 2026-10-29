import { playerCard, sectionCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";

export const alt = "Eko United FC player profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

export default async function OpengraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const player = await apiFetch<DemoPlayer>(`/players/${slug}`, 1800);
  return player ? playerCard(player) : sectionCard("team");
}
