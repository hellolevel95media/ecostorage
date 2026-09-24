import Link from "next/link";
import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import type { Article } from "@/types/database";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/resources/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover"
    >
      <MediaPlaceholder ratio="video" label={article.title} />
      <div className="flex flex-1 flex-col p-5">
        {article.category && (
          <span className="text-xs font-semibold tracking-wide text-brand uppercase">
            {article.category}
          </span>
        )}
        <h3 className="mt-2 font-semibold group-hover:text-brand">{article.title}</h3>
        {article.excerpt && (
          <p className="mt-2 flex-1 text-sm text-foreground/70">{article.excerpt}</p>
        )}
        {article.published_at && (
          <p className="mt-4 text-xs text-foreground/40">
            {new Date(article.published_at).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}
