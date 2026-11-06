import { SITE_URL } from "@/lib/site";
import type { FaqItem } from "@/lib/article-body";

interface ArticleJsonLdProps {
  title: string;
  description: string;
  slug: string;
  publishedAt: string | null;
  updatedAt: string;
  author: string | null;
  faq?: FaqItem[];
}

/** schema.org Article structured data — helps both traditional search rich
 * results and AI/LLM crawlers correctly attribute and date this content, and
 * to see edits (dateModified) as a freshness signal, not just publish date. */
export function ArticleJsonLd({ title, description, slug, publishedAt, updatedAt, author, faq = [] }: ArticleJsonLdProps) {
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Resources", item: `${SITE_URL}/resources` },
      { "@type": "ListItem", position: 3, name: title, item: `${SITE_URL}/resources/${slug}` },
    ],
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: `${SITE_URL}/resources/${slug}`,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    dateModified: updatedAt,
    // "EcoStorage Team" (the only byline this CMS currently produces) reads
    // as an organizational byline, not an individual — Person would be
    // factually wrong and is the kind of mismatch Google's Rich Results
    // Test flags. Treat any "... Team" author as an Organization; a real
    // named individual would still get Person.
    ...(author
      ? { author: { "@type": /\bteam\b/i.test(author) ? "Organization" : "Person", name: author } }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "EcoStorage",
      url: SITE_URL,
    },
  };

  // Built from an "## Frequently asked questions" section in the body.
  // Google only shows FAQ rich results for a few authoritative sites now,
  // but the markup still gives search and AI crawlers clean Q&A pairs.
  const faqLd = faq.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: { "@type": "Answer", text: item.answer },
        })),
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      {faqLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />}
    </>
  );
}
