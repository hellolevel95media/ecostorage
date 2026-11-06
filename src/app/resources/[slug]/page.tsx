import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import { getArticleBySlug, getPublishedArticles } from "@/lib/content";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { formatDate } from "@/lib/format";
import { buildMetadata } from "@/lib/site";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";
import { extractFaq, parseArticleBody } from "@/lib/article-body";
import { InlineText } from "@/components/ui/InlineText";
import { inferMediaKind } from "@/lib/media";

export const revalidate = 60;

// Pre-build every published article so it is served from the cache; slugs
// published later are rendered on first visit, then cached too.
export async function generateStaticParams() {
  const articles = await getPublishedArticles(undefined, "all");
  return articles.map((a) => ({ slug: a.slug }));
}

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_DESCRIPTION =
  "A practical storage guide covering packing, records retention and storage in Singapore.";

// Admin-entered excerpts have no length limit in the CMS form — cap what
// flows into <meta description> / og:description so a very long excerpt
// doesn't produce a malformed-looking (or crawler-truncated) tag.
function metaDescription(excerpt: string | null): string {
  const text = excerpt?.trim();
  if (!text) return FALLBACK_DESCRIPTION;
  if (text.length <= 155) return text;
  const cut = text.slice(0, 154);
  return `${cut.slice(0, cut.lastIndexOf(" ")).replace(/[,;:.\s]+$/, "")}…`;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return buildMetadata({ title: "Storage Guide", description: FALLBACK_DESCRIPTION, path: `/resources/${slug}` });
  return buildMetadata({
    title: article.title.trim() || "Storage Guide",
    description: metaDescription(article.excerpt),
    path: `/resources/${slug}`,
    article: { publishedTime: article.published_at, modifiedTime: article.updated_at },
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  const sameLanguage = await getPublishedArticles(undefined, article.locale);
  const others = sameLanguage.filter((a) => a.slug !== slug);
  const related = [
    ...others.filter((a) => a.category === article.category),
    ...others.filter((a) => a.category !== article.category),
  ].slice(0, 3);
  const blocks = article.body ? parseArticleBody(article.body) : [];
  const faq = extractFaq(blocks);

  return (
    <article lang={article.locale} className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticleJsonLd
        title={article.title}
        description={metaDescription(article.excerpt)}
        slug={slug}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
        author={article.author}
        faq={faq}
      />
      <Link href="/resources" className="text-sm font-semibold text-brand-ink hover:underline">
        ← Back to resources
      </Link>

      {article.category && (
        <p className="mt-4 text-xs font-semibold tracking-wide text-brand-ink uppercase">
          {article.category}
        </p>
      )}
      <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{article.title}</h1>
      {article.published_at && (
        <p className="mt-2 text-sm text-foreground/60">
          {formatDate(article.published_at, article.locale)}
          {article.author ? ` · ${article.author}` : ""}
        </p>
      )}

      <div className="mt-6">
        {article.thumbnail_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.thumbnail_url}
            alt={article.title}
            className="aspect-video w-full rounded-xl object-cover"
          />
        ) : (
          <MediaPlaceholder ratio="wide" label={article.title} />
        )}
      </div>

      {/* max-w-prose (65ch) keeps body text at a comfortable reading
          measure even though the title/hero image above use the wider
          max-w-3xl column — unconstrained text at that width ran well
          over 100 characters per line. */}
      <div className="mt-8 max-w-prose space-y-4 text-foreground/80">
        {article.excerpt && <p className="text-lg text-foreground">{article.excerpt}</p>}
        {blocks.length ? (
          blocks.map((block, i) =>
            block.type === "media" ? (
              inferMediaKind(block.url) === "video" ? (
                <video key={i} src={block.url} controls muted playsInline className="w-full rounded-xl" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={block.url} alt="" className="w-full rounded-xl" />
              )
            ) : block.type === "heading" ? (
              <h2 key={i} className="pt-4 text-xl font-semibold text-foreground">
                {block.text}
              </h2>
            ) : block.type === "subheading" ? (
              <h3 key={i} className="pt-2 text-lg font-semibold text-foreground">
                {block.text}
              </h3>
            ) : block.type === "list" ? (
              <ul key={i} className="list-disc space-y-1 pl-5">
                {block.items.map((item, j) => (
                  <li key={j}>
                    <InlineText text={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <p key={i}>
                <InlineText text={block.text} />
              </p>
            )
          )
        ) : (
          <p>Full article content will appear here once published from the admin CMS.</p>
        )}
      </div>

      <div className="mt-10">
        <ButtonLink href="/contact">Talk to an EcoStorage specialist</ButtonLink>
      </div>

      {related.length > 0 && (
        <section className="mt-14 border-t border-border pt-8" aria-labelledby="keep-reading">
          <h2 id="keep-reading" className="text-xl font-bold">
            {article.locale === "zh" ? "继续阅读" : "Keep reading"}
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
