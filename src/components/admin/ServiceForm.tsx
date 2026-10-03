"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { Service, ServiceCategory } from "@/types/database";

export function ServiceForm({ service }: { service?: Service }) {
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
      category: form.get("category") as ServiceCategory,
      description: String(form.get("description") ?? "") || null,
      thumbnail_url: String(form.get("thumbnail_url") ?? "") || null,
      video_url: String(form.get("video_url") ?? "") || null,
      cta_text: String(form.get("cta_text") ?? "") || null,
      cta_link: String(form.get("cta_link") ?? "") || null,
      sort_order: Number(form.get("sort_order") ?? 0),
    };

    const supabase = createClient();
    const { error: dbError } = service
      ? await supabase.from("services").update(payload).eq("id", service.id)
      : await supabase.from("services").insert(payload);

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: ["/services", "/personal", "/corporate"] }),
    }).catch(() => {});

    router.push("/admin/services");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Title" name="title" defaultValue={service?.title} required />
        <TextField label="Slug" name="slug" defaultValue={service?.slug} required />
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/60">Category</label>
          <select
            name="category"
            defaultValue={service?.category ?? "personal"}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          >
            <option value="personal">Personal</option>
            <option value="corporate">Corporate</option>
          </select>
        </div>
        <TextField
          label="Sort order"
          name="sort_order"
          type="number"
          defaultValue={String(service?.sort_order ?? 0)}
        />
        <MediaPicker
          label="Thumbnail"
          name="thumbnail_url"
          kind="image"
          defaultValue={service?.thumbnail_url ?? ""}
        />
        <MediaPicker
          label="Video"
          name="video_url"
          kind="video"
          defaultValue={service?.video_url ?? ""}
        />
        <TextField label="CTA text" name="cta_text" defaultValue={service?.cta_text ?? ""} />
        <TextField label="CTA link" name="cta_link" defaultValue={service?.cta_link ?? ""} />
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-foreground/60">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={service?.description ?? ""}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving..." : service ? "Save changes" : "Create service"}
      </Button>
    </form>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  required = false,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/60">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
