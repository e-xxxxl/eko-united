import { sectionCard } from "@/lib/og/cards";

export const alt = "Results | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return sectionCard("results");
}
