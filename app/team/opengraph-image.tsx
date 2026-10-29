import { squadCard } from "@/lib/og/cards";
import { apiList } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";

export const alt = "First Team Squad | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

export default async function OpengraphImage() {
  return squadCard(await apiList<DemoPlayer>("/players?role=player", 1800));
}
