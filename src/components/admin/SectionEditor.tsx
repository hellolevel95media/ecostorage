"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import type { SectionCopy } from "@/lib/fallback-content";
import type { TrustStat } from "@/types/database";
import { parseCommitments, serializeCommitments, type Commitment } from "@/lib/commitments";

type FieldKey = "heading" | "subheading" | "body" | "button" | "media" | "stats" | "commitments";

const SECTION_CONFIG: Record<string, { name: string; help: string; fields: FieldKey[] }> = {
  hero: {
    name: "Top banner",
    help: "The big headline area at the very top of the page.",
    fields: ["heading", "subheading", "button", "media"],
  },
  trust_banner: {
    name: "Trust numbers banner",
    help: "The row of four count-up numbers that builds confidence.",
    fields: ["heading", "body", "stats"],
  },
  trust_segment: {
    name: "Commitment banner",
    help: "A reassuring promise to visitors, shown as a short message with a few commitment cards.",
    fields: ["heading", "commitments", "button"],
  },
  intro: {
    name: "Page introduction",
    help: "The heading and one-line description at the top of this page.",
    fields: ["heading", "subheading"],
  },
  referral_intro: {
    name: "Referral introduction",
    help: "A short explanation of the referral programme.",
    fields: ["heading", "body"],
  },
};

const DEFAULT_CONFIG = {
  name: "",
  help: "A section of this page.",
  fields: ["heading", "subheading", "body", "button", "media"] as FieldKey[],
};

const EMPTY_STAT: TrustStat = { value: 0, suffix: "", label: "" };

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand";

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
  const config = SECTION_CONFIG[sectionKey] ?? { ...DEFAULT_CONFIG, name: sectionKey };
  const has = (f: FieldKey) => config.fields.includes(f);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);

  const [stats, setStats] = useState<TrustStat[]>(
    initial.stats && initial.stats.length > 0 ? initial.stats : [EMPTY_STAT, EMPTY_STAT, EMPTY_STAT, EMPTY_STAT]
  );
  const parsed = parseCommitments(initial.body);
  const [intro, setIntro] = useState(parsed.intro);
  const [points, setPoints] = useState<Commitment[]>(parsed.points);

  function touch() {
    setDirty(true);
    setSaved(false);
  }
  function updateStat(index: number, patch: Partial<TrustStat>) {
    setStats((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    touch();
  }
  function updatePoint(index: number, patch: Partial<Commitment>) {
    setPoints((prev) => prev.map((p, i) => (i === index ? { ...p, ...patch } : p)));
    touch();
  }
  function movePoint(index: number, dir: -1 | 1) {
    setPoints((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    touch();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) ?? "").trim();
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

    const body = has("commitments") ? serializeCommitments(intro, points) : has("body") ? text("body") : initial.body;

    const { error: sectionError } = await supabase.from("sections").upsert(
      {
        page_id: page.id,
        section_key: sectionKey,
        heading: (has("heading") ? text("heading") : initial.heading) || null,
        subheading: (has("subheading") ? text("subheading") : initial.subheading) || null,
        body: body || null,
        media_url: (has("media") ? text("media_url") : initial.media_url) || null,
        cta_text: (has("button") ? text("cta_text") : initial.cta_text) || null,
        cta_link: (has("button") ? text("cta_link") : initial.cta_link) || null,
        stats: has("stats") ? stats.filter((s) => s.label.trim().length > 0) : null,
      },
      { onConflict: "page_id,section_key" }
    );

    setSaving(false);

    if (sectionError) {
      setError(sectionError.message);
      return;
    }

    setSaved(true);
    setDirty(false);
    router.refresh();

    const publicPath = pageSlug === "home" ? "/" : `/${pageSlug}`;
    fetch("/api/revalidate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: [publicPath] }),
    }).catch(() => {});
  }

  return (
    <form
      onSubmit={handleSubmit}
      onInput={touch}
      aria-label={config.name}
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <h3 className="text-base font-semibold">{config.name}</h3>
      <p className="mt-1 text-sm text-foreground/60">{config.help}</p>

      <div className={has("media") ? "mt-5 grid gap-6 lg:grid-cols-[1fr_18rem]" : "mt-5"}>
        <div className="min-w-0 space-y-4">
          {(has("heading") || has("subheading")) && (
            <div className={has("heading") && has("subheading") ? "grid gap-4 sm:grid-cols-2" : ""}>
              {has("heading") && (
                <Field
                  label="Headline"
                  hint="The main title. Keep it short."
                  name="heading"
                  defaultValue={initial.heading}
                />
              )}
              {has("subheading") && (
                <Field
                  label="Sub-headline"
                  hint="One supporting line under the headline."
                  name="subheading"
                  defaultValue={initial.subheading}
                />
              )}
            </div>
          )}

          {has("body") && (
            <TextAreaField
              label={has("stats") ? "Supporting sentence" : "Main text"}
              hint="Plain sentences. No formatting needed."
              name="body"
              defaultValue={initial.body}
              rows={has("stats") ? 2 : 5}
            />
          )}

          {has("commitments") && (
            <>
              <TextAreaField
                label="Opening message"
                hint="A gentle sentence shown under the headline."
                name="intro"
                value={intro}
                onChange={(v) => {
                  setIntro(v);
                  touch();
                }}
                rows={2}
              />
              <div>
                <p className="text-xs font-medium text-foreground/60">Commitment cards</p>
                <p className="mb-2 text-xs text-foreground/50">
                  Each card is one promise: a short title and a sentence of detail. Up to 6.
                </p>
                <div className="space-y-3">
                  {points.map((p, i) => (
                    <div key={i} className="rounded-lg border border-border bg-background/50 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-foreground/50">Card {i + 1}</span>
                        <div className="flex gap-1">
                          <MiniButton label="Move up" onClick={() => movePoint(i, -1)} disabled={i === 0}>
                            ↑
                          </MiniButton>
                          <MiniButton label="Move down" onClick={() => movePoint(i, 1)} disabled={i === points.length - 1}>
                            ↓
                          </MiniButton>
                          <MiniButton
                            label="Remove card"
                            onClick={() => {
                              setPoints((prev) => prev.filter((_, j) => j !== i));
                              touch();
                            }}
                          >
                            Remove
                          </MiniButton>
                        </div>
                      </div>
                      <div className="mt-2 space-y-2">
                        <input
                          aria-label={`Card ${i + 1} title`}
                          placeholder="Title, e.g. Clear, kind communication"
                          value={p.title}
                          onChange={(e) => updatePoint(i, { title: e.target.value })}
                          className={inputClass}
                        />
                        <textarea
                          aria-label={`Card ${i + 1} detail`}
                          placeholder="One or two sentences explaining the promise"
                          rows={2}
                          value={p.text}
                          onChange={(e) => updatePoint(i, { text: e.target.value })}
                          className={`${inputClass} resize-y`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                {points.length < 6 && (
                  <button
                    type="button"
                    onClick={() => {
                      setPoints((prev) => [...prev, { title: "", text: "" }]);
                      touch();
                    }}
                    className="mt-3 rounded-lg border border-dashed border-border px-3 py-2 text-sm font-medium text-brand-ink hover:border-brand"
                  >
                    + Add a card
                  </button>
                )}
              </div>
            </>
          )}

          {has("stats") && (
            <div>
              <p className="text-xs font-medium text-foreground/60">The four numbers</p>
              <p className="mb-2 text-xs text-foreground/50">
                Each number counts up when visitors scroll to it. Leave a description empty to hide that number.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {stats.map((stat, i) => (
                  <div key={i} className="space-y-2 rounded-lg border border-border bg-background/50 p-3">
                    <span className="text-xs font-semibold text-foreground/50">Number {i + 1}</span>
                    <div className="grid grid-cols-[1fr_5rem] gap-2">
                      <div>
                        <label className="mb-1 block text-xs text-foreground/60">Number</label>
                        <input
                          type="number"
                          aria-label={`Number ${i + 1} value`}
                          value={stat.value}
                          onChange={(e) => updateStat(i, { value: Number(e.target.value) || 0 })}
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs text-foreground/60">After it</label>
                        <input
                          aria-label={`Number ${i + 1} suffix`}
                          placeholder="+ or %"
                          value={stat.suffix ?? ""}
                          onChange={(e) => updateStat(i, { suffix: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-foreground/60">What it counts</label>
                      <input
                        aria-label={`Number ${i + 1} description`}
                        placeholder="e.g. Happy customers"
                        value={stat.label}
                        onChange={(e) => updateStat(i, { label: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                    <label className="flex items-center gap-2 text-xs text-foreground/60">
                      <input
                        type="checkbox"
                        checked={Boolean(stat.emphasis)}
                        onChange={(e) => updateStat(i, { emphasis: e.target.checked })}
                      />
                      Highlight this number in green
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {has("button") && (
            <div>
              <p className="text-xs font-medium text-foreground/60">Button</p>
              <p className="mb-2 text-xs text-foreground/50">
                {sectionKey === "trust_segment"
                  ? "Leave the text empty to use the standard “Get a Free Quote” button."
                  : "Leave the text empty to use the standard wording for this page."}
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="What the button says" name="cta_text" defaultValue={initial.cta_text} />
                <Field label="Where it goes (e.g. /contact)" name="cta_link" defaultValue={initial.cta_link} />
              </div>
            </div>
          )}
        </div>

        {has("media") && (
          <div>
            <MediaPicker
              label="Background image or video"
              name="media_url"
              kind="any"
              defaultValue={initial.media_url ?? ""}
            />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border pt-4">
        <Button type="submit" disabled={saving || !dirty}>
          {saving ? "Saving..." : "Save changes"}
        </Button>
        {dirty && !saving && <span className="text-sm text-foreground/60">You have unsaved changes</span>}
        {saved && <span className="text-sm text-brand-ink">Saved. Live on the site within a minute.</span>}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm text-red-500">
          Could not save: {error}
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  hint,
  name,
  defaultValue,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
      </label>
      <input id={id} name={name} defaultValue={defaultValue} className={inputClass} />
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

function TextAreaField({
  label,
  hint,
  name,
  defaultValue,
  value,
  onChange,
  rows = 3,
}: {
  label: string;
  hint?: string;
  name: string;
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  rows?: number;
}) {
  const id = useId();
  const controlled = value !== undefined && onChange;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs font-medium text-foreground/60">
        {label}
      </label>
      <textarea
        id={id}
        name={name}
        rows={rows}
        {...(controlled ? { value, onChange: (e) => onChange(e.target.value) } : { defaultValue })}
        className={`${inputClass} resize-y`}
      />
      {hint && <p className="mt-1 text-xs text-foreground/50">{hint}</p>}
    </div>
  );
}

function MiniButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="rounded-md border border-border px-2 py-1 text-xs text-foreground/70 hover:border-brand disabled:opacity-30"
    >
      {children}
    </button>
  );
}
