import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";

export const alt = "About the Club | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const list = await apiFetch<DemoPlayer[]>("/players?role=management", 1800);
  const people = (Array.isArray(list) ? list : []).filter((p) => p.photoUrl);
  return collageCard("about", people.map((p) => ({ url: p.photoUrl })));
}
