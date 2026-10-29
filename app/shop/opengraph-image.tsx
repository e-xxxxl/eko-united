import { collageCard } from "@/lib/og/cards";
import { apiFetch } from "@/lib/api";
import type { DemoProduct } from "@/lib/demoData";

export const alt = "Club Shop | Eko United FC";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 1800;

// The share card shows the photos that are on this page.
export default async function OpengraphImage() {
  const list = await apiFetch<DemoProduct[]>("/products", 1800);
  const products = (Array.isArray(list) ? list : []).filter((p) => p.images?.[0]);
  return collageCard("shop", products.map((p) => ({ url: p.images[0] })));
}
