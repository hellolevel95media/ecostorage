"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";
import type { TrustStat } from "@/types/database";

const EMPTY_STAT: TrustStat = { value: 0, suffix: "", label: "" };

export function SectionEditor({
  pageSlug,
  pageTitle,
  sectionKey,
  initial,
}: {
  pageSlug: string;
  pageTitle: string;
  sectionKey: string;
  initial: SectionCopy;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const hasStats = sectionKey === "trust_banner";
  const [stats, setStats] = useState<TrustStat[]>(
    initial.stats && initial.stats.length > 0 ? initial.stats : [EMPTY_STAT, EMPTY_STAT, EMPTY_STAT, EMPTY_STAT]
  );

  function updateStat(index: number, patch: Partial<TrustStat>) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    const { data: page, error: pageError } = await supabase
      .from("pages")
      .upsert({ slug: pageSlug, title: pageTitle }, { onConflict: "slug" })
      .select("id")
      .single();

    if (pageError || !page) {
      setSaving(false);
      setError(pageError?.message ?? "Could not save page");
      return;
    }

    const { error: sectionError } = await supabase.from("sections").upsert(
      {
        page_id: page.id,
        section_key: sectionKey,
        heading: String(form.get("heading") ?? "") || null,
        subheading: String(form.get("subheading") ?? "") || null,
        body: String(form.get("body") ?? "") || null,
        cta_text: String(form.get("cta_text") ?? "") || null,
        cta_link: String(form.get("cta_link") ?? "") || null,
        stats: hasStats ? stats.filter((s) => s.label.trim().length > 0) : null,
      },
      { onConflict: "page_id,section_key" }
    );

    setSaving(false);

    if (sectionError) {
      setError(sectionError.message);
      return;
    }

    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs font-semibold tracking-wide text-brand uppercase">{sectionKey}</p>

      <div className="mt-3 space-y-3">
        <Field label="Heading" name="heading" defaultValue={initial.heading} />
        <Field label="Subheading" name="subheading" defaultValue={initial.subheading} />
        <div>
          <label className="mb-1 block text-xs font-medium text-foreground/60">Body</label>
          <textarea
            name="body"
            rows={3}
            defaultValue={initial.body}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="CTA text" name="cta_text" defaultValue={initial.cta_text} />
          <Field label="CTA link" name="cta_link" defaultValue={initial.cta_link} />
        </div>

        {hasStats && (
          <div>
            <p className="mb-2 text-xs font-medium text-foreground/60">Trust stats (4 count-up bubbles)</p>
            <div className="space-y-3">
              {stats.map((stat, i) => (
                <div key={i} className="grid grid-cols-[1fr_4rem_4rem_auto] items-end gap-2 rounded-lg border border-border p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/60">Label</label>
                    <input
                      value={stat.label}
                      onChange={(e) => updateStat(i, { label: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/60">Value</label>
                    <input
                      type="number"
                      value={stat.value}
                      onChange={(e) => updateStat(i, { value: Number(e.target.value) || 0 })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-foreground/60">Suffix</label>
                    <input
                      value={stat.suffix ?? ""}
                      onChange={(e) => updateStat(i, { suffix: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
                    />
                  </div>
                  <label className="flex items-center gap-1 pb-2 text-xs text-foreground/60">
                    <input
                      type="checkbox"
                      checked={Boolean(stat.emphasis)}
                      onChange={(e) => updateStat(i, { emphasis: e.target.checked })}
                    />
                    Emphasis
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save section"}
        </Button>
        {saved && <span className="text-sm text-brand">Saved</span>}
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-foreground/60">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
    </div>
  );
}
