import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import { getArticleBySlug } from "@/lib/content";
import { buildMetadata } from "@/lib/site";
import { ArticleJsonLd } from "@/components/seo/ArticleJsonLd";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

const FALLBACK_DESCRIPTION =
  "A storage guide from EcoStorage's resource library — practical advice on packing, records retention, and climate-controlled storage in Singapore.";

// Admin-entered excerpts have no length limit in the CMS form — cap what
// flows into <meta description> / og:description so a very long excerpt
// doesn't produce a malformed-looking (or crawler-truncated) tag.
function metaDescription(excerpt: string | null): string {
  const text = excerpt?.trim();
  if (!text) return FALLBACK_DESCRIPTION;
  return text.length > 200 ? `${text.slice(0, 199)}…` : text;
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return buildMetadata({ title: "Article | EcoStorage", description: FALLBACK_DESCRIPTION, path: `/resources/${slug}` });
  return buildMetadata({
    title: article.title.trim() ? `${article.title} | EcoStorage` : "Article | EcoStorage",
    description: metaDescription(article.excerpt),
    path: `/resources/${slug}`,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <ArticleJsonLd
        title={article.title}
        description={metaDescription(article.excerpt)}
        slug={slug}
        publishedAt={article.published_at}
        updatedAt={article.updated_at}
        author={article.author}
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
        <p className="mt-2 text-sm text-foreground/50">
          {new Date(article.published_at).toLocaleDateString()}
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

      <div className="mt-8 space-y-4 text-foreground/80">
        {article.excerpt && <p className="text-lg text-foreground">{article.excerpt}</p>}
        {article.body ? (
          article.body
            .split("\n\n")
            .map((paragraph, i) => <p key={i}>{paragraph}</p>)
        ) : (
          <p>Full article content will appear here once published from the admin CMS.</p>
        )}
      </div>

      <div className="mt-10">
        <ButtonLink href="/contact">Talk to a EcoStorage specialist</ButtonLink>
      </div>
    </article>
  );
}
