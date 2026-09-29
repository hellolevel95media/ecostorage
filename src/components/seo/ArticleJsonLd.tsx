import { SITE_URL } from "@/lib/site";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  author: string | null;
}

/** schema.org Article structured data — helps both traditional search rich
 * results and AI/LLM crawlers correctly attribute and date this content. */
export function ArticleJsonLd({ title, description, slug, publishedAt, author }: ArticleJsonLdProps) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/resources/${slug}`,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(author ? { author: { "@type": "Person", name: author } } : {}),
    publisher: {
      "@type": "Organization",
      name: "EcoStorage",
      url: SITE_URL,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
