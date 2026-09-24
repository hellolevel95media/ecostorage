"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { Article, ArticleStatus } from "@/types/database";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const form = new FormData(event.currentTarget);
    const payload = {
      slug: String(form.get("slug") ?? "").trim(),
      title: String(form.get("title") ?? "").trim(),
      category: String(form.get("category") ?? "") || null,
      tags: String(form.get("tags") ?? "")
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      thumbnail_url: String(form.get("thumbnail_url") ?? "") || null,
      excerpt: String(form.get("excerpt") ?? "") || null,
      body: String(form.get("body") ?? ""),
      status: form.get("status") as ArticleStatus,
      author: String(form.get("author") ?? "") || null,
      published_at:
        form.get("status") === "published"
          ? (article?.published_at ?? new Date().toISOString())
          : null,
    };

    const supabase = createClient();
    const { error: dbError } = article
      ? await supabase.from("articles").update(payload).eq("id", article.id)
      : await supabase.from("articles").insert(payload);

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" name="title" defaultValue={article?.title} required />
        <TextField label="Slug" name="slug" defaultValue={article?.slug} required />
        <TextField label="Category" name="category" defaultValue={article?.category ?? ""} />
        <TextField
          label="Tags (comma separated)"
          name="tags"
          defaultValue={article?.tags?.join(", ") ?? ""}
        />
        <TextField
          label="Thumbnail URL"
          name="thumbnail_url"
          defaultValue={article?.thumbnail_url ?? ""}
        />
        <TextField label="Author" name="author" defaultValue={article?.author ?? ""} />
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/60">Status</label>
          <select
            name="status"
            defaultValue={article?.status ?? "draft"}
            className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/60">Excerpt</label>
        <textarea
          name="excerpt"
          rows={2}
          defaultValue={article?.excerpt ?? ""}
          className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/60">Body</label>
        <textarea
          name="body"
          rows={10}
          defaultValue={article?.body ?? ""}
          className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : article ? "Save changes" : "Create article"}
      </Button>
    </form>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required = false,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/60">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
