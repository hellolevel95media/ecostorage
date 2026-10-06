import { createServerSupabaseClient } from "@/lib/supabase/server";
import { FALLBACK_SECTIONS, FALLBACK_SERVICES, type SectionCopy } from "@/lib/fallback-content";
import type { Article, Section, Service } from "@/types/database";

function fallbackServicesAsRows(category?: "personal" | "corporate"): Service[] {
  const now = new Date().toISOString();
  return FALLBACK_SERVICES.filter((s) => !category || s.category === category).map((s, i) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    category: s.category,
    description: s.description,
    thumbnail_url: null,
    video_url: null,
    cta_text: s.cta_text,
    cta_link: s.cta_link,
    sort_order: i,
    created_at: now,
    updated_at: now,
  }));
}

/**
 * All fetchers fail soft: if Supabase isn't reachable/configured yet (e.g.
 * during local scaffolding before a project is linked), pages fall back to
 * static copy instead of throwing, so the site still renders.
 */

export async function getPageSections(pageSlug: string): Promise<Section[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: page } = await supabase
      .from("pages")
      .select("id")
      .eq("slug", pageSlug)
      .maybeSingle();

    if (!page) return [];

    const { data, error } = await supabase
      .from("sections")
      .select("*")
      .eq("page_id", page.id)
      .order("sort_order", { ascending: true });

    if (error) throw error;
    return data ?? [];
  } catch {
    return [];
  }
}

export function resolveSection(
  sections: Section[],
  pageSlug: string,
  sectionKey: string
): SectionCopy {
  const dbSection = sections.find((s) => s.section_key === sectionKey);
  const fallback = FALLBACK_SECTIONS[pageSlug]?.[sectionKey] ?? {};

  if (!dbSection) return fallback;

  return {
    heading: dbSection.heading ?? fallback.heading,
    subheading: dbSection.subheading ?? fallback.subheading,
    body: dbSection.body ?? fallback.body,
    media_url: dbSection.media_url ?? fallback.media_url ?? null,
    cta_text: dbSection.cta_text ?? fallback.cta_text,
    cta_link: dbSection.cta_link ?? fallback.cta_link,
    stats: dbSection.stats ?? fallback.stats,
  };
}

export async function getPublishedArticles(
  limit?: number,
  // Defaults to "en" so every existing call site (home page, personal page,
  // the main /resources grid) keeps showing exactly what it shows today,
  // unchanged, even after Chinese articles exist — nothing mixes languages
  // unless a caller explicitly asks for "zh" (the dedicated Chinese hub) or
  // "all" (the sitemap, which should list every published page regardless
  // of language).
  locale: "en" | "zh" | "all" = "en"
): Promise<Article[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase
      .from("articles")
      .select("*")
      .eq("status", "published")
      .order("published_at", { ascending: false });

    if (locale !== "all") query = query.eq("locale", locale);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    // No demo-article fallback here deliberately — real CMS content exists
    // now, so zero published rows means genuinely zero published articles
    // (e.g. everything is still in draft), not an unconfigured site. Showing
    // fake placeholder articles in that case meant the live site, and the
    // sitemap submitted to Google, were serving thin boilerplate pages
    // ("Full article content will appear here...") under real-sounding
    // titles whenever nothing happened to be published yet.
    return data ?? [];
  } catch {
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("articles")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  } catch {
    return null;
  }
}

export async function getServices(category?: "personal" | "corporate"): Promise<Service[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("services").select("*").order("sort_order", { ascending: true });
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw error;
    return data && data.length > 0 ? data : fallbackServicesAsRows(category);
  } catch {
    return fallbackServicesAsRows(category);
  }
}
