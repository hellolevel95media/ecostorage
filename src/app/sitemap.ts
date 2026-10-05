import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getPublishedArticles } from "@/lib/content";

const STATIC_ROUTES = [
  "",
  "/personal",
  "/corporate",
  "/services",
  "/mission",
  "/partner",
  "/contact",
  "/resources",
  "/privacy",
  "/cookies",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  // No lastModified here deliberately — this route is forced dynamic (the
  // Supabase call below reads cookies()), so new Date() would mean every
  // static page reports "modified right now" on every single sitemap
  // request, an inaccurate freshness signal search engines weight real
  // trust on. Omit it rather than lie; article entries below have a real
  // updated_at to report instead.
  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: path === "" ? "daily" : "weekly",
    priority: path === "" ? 1 : 0.7,
  }));

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/resources/${article.slug}`,
    lastModified: article.updated_at ? new Date(article.updated_at) : new Date(),
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticEntries, ...articleEntries];
}
