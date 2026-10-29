import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoPlayer } from "@/lib/demoData";

export const alt = "Coaching and Technical Staff | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const [coaches, staff] = await Promise.all([
    apiFetch<DemoPlayer[]>("/players?role=coach", 1800),
    apiFetch<DemoPlayer[]>("/players?role=technical_staff", 1800),
  ]);
  const people = [...(Array.isArray(coaches) ? coaches : []), ...(Array.isArray(staff) ? staff : [])].filter((p) => p.photoUrl);
  return collageCard("coachingStaff", people.map((p) => ({ url: p.photoUrl, cutout: p.photoCutout })));
}
