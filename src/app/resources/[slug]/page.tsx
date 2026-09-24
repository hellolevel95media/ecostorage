import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import { getArticleBySlug } from "@/lib/content";

export const dynamic = "force-dynamic";

interface ArticlePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  return { title: article ? `${article.title} | EcoStorage` : "Article | EcoStorage" };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/resources" className="text-sm font-semibold text-brand hover:underline">
        ← Back to resources
      </Link>

      {article.category && (
        <p className="mt-4 text-xs font-semibold tracking-wide text-brand uppercase">
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
        <MediaPlaceholder ratio="wide" label={article.title} />
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
