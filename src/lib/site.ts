import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ecostorage.sg";

/**
 * Every page previously only set `title`, so it silently inherited the root
 * layout's openGraph/twitter block (homepage title, description, and URL)
 * regardless of which page was actually being shared — this is what any
 * link-preview card, social share, or AI/LLM crawler reading OG tags would
 * have seen. This gives each page its own accurate title/description/OG/
 * Twitter/canonical URL in one call instead of repeating that shape 8 times.
 */
export function buildMetadata({
  title,
  description,
  path,
  article,
}: {
  title: string;
  description: string;
  path: string;
  /** Set for /resources article pages — gives social shares/crawlers the
   * proper og:type=article with real publish/modify dates instead of the
   * generic website type every page got before. */
  article?: { publishedTime?: string | null; modifiedTime?: string };
}): Metadata {
  const url = path === "/" ? SITE_URL : `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: article
      ? {
          title,
          description,
          url,
          siteName: "EcoStorage",
          locale: "en_SG",
          type: "article",
          ...(article.publishedTime ? { publishedTime: article.publishedTime } : {}),
          ...(article.modifiedTime ? { modifiedTime: article.modifiedTime } : {}),
        }
      : {
          title,
          description,
          url,
          siteName: "EcoStorage",
          locale: "en_SG",
          type: "website",
        },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
