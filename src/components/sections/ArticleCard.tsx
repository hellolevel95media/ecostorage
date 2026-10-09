import Link from "next/link";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { formatDate } from "@/lib/format";
import type { Article } from "@/types/database";

export function ArticleCard({ article, headingLevel: Heading = "h3" }: { article: Article; headingLevel?: "h2" | "h3" }) {
  return (
    <Link
      href={`/resources/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
    >
      {article.thumbnail_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={article.thumbnail_url}
          alt={article.title}
          className="aspect-video w-full object-cover"
        />
      ) : (
        <MediaPlaceholder ratio="video" label={article.title} />
      )}
      <div className="flex flex-1 flex-col p-5">
        {article.category && (
          <span className="text-xs font-semibold tracking-wide text-brand-ink uppercase">
            {article.category}
          </span>
        )}
        <Heading className="mt-2 font-semibold group-hover:text-brand-ink">{article.title}</Heading>
        {article.excerpt && (
          <p className="mt-2 flex-1 text-sm text-foreground/70">{article.excerpt}</p>
        )}
        {article.published_at && (
          <p className="mt-4 text-xs text-foreground/60">
            {formatDate(article.published_at, article.locale)}
          </p>
        )}
      </div>
    </Link>
  );
}
