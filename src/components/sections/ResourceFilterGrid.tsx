"use client";

import { useMemo, useState } from "react";
import { ArticleCard } from "@/components/sections/ArticleCard";
import type { Article } from "@/types/database";

export function ResourceFilterGrid({ articles }: { articles: Article[] }) {
  const topics = useMemo(() => {
    const set = new Set(articles.map((a) => a.category).filter(Boolean) as string[]);
    return ["All", ...Array.from(set)];
  }, [articles]);

  const [topic, setTopic] = useState("All");

  const filtered =
    topic === "All" ? articles : articles.filter((a) => a.category === topic);

  return (
    <div className="grid gap-8 lg:grid-cols-[200px_1fr]">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">By topic</p>
        <nav className="mt-3 flex flex-wrap gap-2 lg:flex-col">
          {topics.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTopic(t)}
              className={`rounded-full px-3 py-1.5 text-left text-sm font-medium transition-colors lg:rounded-lg ${
                topic === t ? "bg-brand text-brand-foreground" : "bg-card text-foreground/70 hover:text-brand"
              }`}
            >
              {t}
            </button>
          ))}
        </nav>
      </aside>

      <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-sm text-foreground/60">No articles in this topic yet.</p>
        )}
      </div>
    </div>
  );
}
