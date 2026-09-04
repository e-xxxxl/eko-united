import type { MetadataRoute } from "next";
import { apiFetch } from "@/lib/api";

const base = "https://ekounitedfc.com";

const staticRoutes = [
  "",
  "/about",
  "/team",
  "/team/coaching-staff",
  "/fixtures",
  "/results",
  "/news",
  "/gallery",
  "/tickets",
  "/shop",
  "/sponsors",
  "/contact",
  "/trophies",
  "/club-history",
  "/careers",
  "/privacy-policy",
  "/terms",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, players, products] = await Promise.all([
    apiFetch<{ slug: string }[]>("/news?limit=50"),
    apiFetch<{ slug: string; role: string }[]>("/players"),
    apiFetch<{ slug: string }[]>("/products"),
  ]);

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const newsEntries: MetadataRoute.Sitemap = (news || []).map((article) => ({
    url: `${base}/news/${article.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const playerEntries: MetadataRoute.Sitemap = (players || [])
    .filter((player) => player.role === "player" || player.role === "coach")
    .map((player) => ({
      url: `${base}/team/${player.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const productEntries: MetadataRoute.Sitemap = (products || []).map((product) => ({
    url: `${base}/shop/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticEntries, ...newsEntries, ...playerEntries, ...productEntries];
}
