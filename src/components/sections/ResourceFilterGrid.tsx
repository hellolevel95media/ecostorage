"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { CardCarousel } from "@/components/ui/CardCarousel";
import type { Article } from "@/types/database";

export function ResourceFilterGrid({
  articles,
  allLabel = "All",
  byTopicLabel = "By topic",
  emptyMessage = "No articles in this topic yet.",
}: {
  articles: Article[];
  /** These three default to the existing English copy, so the main
   * /resources page is completely unaffected — only the Chinese hub page
   * passes Chinese equivalents. */
  allLabel?: string;
  byTopicLabel?: string;
  emptyMessage?: string;
}) {
  const topics = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean) as string[]);
    return [allLabel, ...Array.from(set)];
  }, [articles, allLabel]);

  const [topic, setTopic] = useState(allLabel);

  const filtered =
    topic === allLabel ? articles : articles.filter((a) => a.category === topic);

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">{byTopicLabel}</p>
        <nav className="mt-3 flex flex-wrap gap-2 lg:flex-col">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-full px-3 py-1.5 text-left text-sm font-medium transition-colors lg:rounded-lg ${
                topic === t ? "bg-brand text-brand-foreground" : "bg-card text-foreground/70 hover:text-brand-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      {filtered.length === 0 ? (
        <p className="mt-6 text-sm text-foreground/60">{emptyMessage}</p>
      ) : (
        <CardCarousel gridClassName="lg:grid-cols-2 xl:grid-cols-3">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardCarousel>
      )}
    </div>
  );
}
