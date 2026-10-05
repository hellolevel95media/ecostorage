"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { AssetGrid } from "@/components/admin/AssetGrid";
import { mediaMarker } from "@/lib/article-body";
import type { Article, ArticleStatus } from "@/types/database";

export function ArticleForm({ article }: { article?: Article }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [body, setBody] = useState(article?.body ?? "");
  const [showInsertMedia, setShowInsertMedia] = useState(false);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const cursorRef = useRef(0);
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  function openInsertMedia() {
    cursorRef.current = bodyRef.current?.selectionStart ?? body.length;
    setShowInsertMedia(true);
  }

  function insertMedia(url: string) {
    const pos = cursorRef.current;
    const before = body.slice(0, pos).replace(/\s+$/, "");
    const after = body.slice(pos).replace(/^\s+/, "");
    const marker = mediaMarker(url);
    const next = [before, marker, after].filter(Boolean).join("\n\n");
    setBody(next);
    setShowInsertMedia(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const formEl = event.currentTarget;
    const form = new FormData(formEl);
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
      body,
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

    fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/resources", `/resources/${payload.slug}`] }),
    }).catch(() => {});

    router.push("/admin/articles");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Title"
        name="title"
        defaultValue={article?.title}
        required
        className="text-lg font-medium"
      />

      <div className="mt-5 grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Main column — the actual writing surface gets the space. */}
        <div className="min-w-0 space-y-4">
          <div>
            <div className="mb-1 flex items-end justify-between">
              <label className="block text-xs font-medium text-foreground/60">Body</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => (showInsertMedia ? setShowInsertMedia(false) : openInsertMedia())}
                  className="text-xs font-medium text-brand-ink hover:underline"
                >
                  {showInsertMedia ? "Close" : "Insert image/video"}
                </button>
                <span className="text-xs text-foreground/40 tabular-nums">{wordCount} words</span>
              </div>
            </div>
            <textarea
              ref={bodyRef}
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={24}
              className="min-h-[60vh] w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm leading-relaxed outline-none focus:border-brand"
            />
            {showInsertMedia && (
              <div className="mt-2">
                <p className="mb-1 text-xs text-foreground/50">
                  Inserts at your last cursor position in the body — click a field above or below first to place
                  it elsewhere.
                </p>
                <AssetGrid kind="any" onPick={insertMedia} />
              </div>
            )}
          </div>

          <TextAreaField label="Excerpt" name="excerpt" defaultValue={article?.excerpt ?? ""} rows={3} />
        </div>

        {/* Sidebar — metadata and publish controls, out of the way of writing
            but reachable without scrolling back up through a long body. */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          <div className="rounded-xl border border-border bg-card p-4">
            <label className="mb-1 block text-xs font-medium text-foreground/60">Status</label>
            <select
              name="status"
              defaultValue={article?.status ?? "draft"}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>

            <div className="mt-3">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Saving..." : article ? "Save changes" : "Create article"}
              </Button>
            </div>
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-card p-4">
            <TextField label="Slug" name="slug" defaultValue={article?.slug} required />
            <TextField label="Category" name="category" defaultValue={article?.category ?? ""} />
            <TextField label="Tags (comma separated)" name="tags" defaultValue={article?.tags?.join(", ") ?? ""} />
            <TextField label="Author" name="author" defaultValue={article?.author ?? ""} />
            <MediaPicker label="Thumbnail" name="thumbnail_url" defaultValue={article?.thumbnail_url ?? ""} />
          </div>
        </div>
      </div>
    </form>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required = false,
  className = "",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  className?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
      </label>
      <input
        id={id}
        name={name}
        defaultValue={defaultValue}
        required={required}
        className={`w-full rounded-lg border border-border bg-background px-3 py-2 outline-none focus:border-brand ${className || "text-sm"}`}
      />
    </div>
  );
}

function TextAreaField({
  label,
  name,
  defaultValue,
  rows = 3,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  rows?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
