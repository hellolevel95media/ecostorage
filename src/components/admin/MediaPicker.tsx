"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { VideoThumb } from "@/components/ui/VideoThumb";
import type { MediaAsset } from "@/types/database";

const PAGE_SIZE = 8;

/**
 * Text field with a "Browse library" toggle that lets an admin pick a
 * previously-uploaded asset's public URL instead of pasting one by hand.
 */
export function MediaPicker({
  label,
  name,
  defaultValue,
  kind = "image",
}: {
  label: string;
  name: string;
  defaultValue?: string;
  /** Which uploaded assets to offer — images for thumbnails, video for
   * banners/service clips. Filters the media library query, not just the UI. */
  kind?: "image" | "video";
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [page, setPage] = useState(0);
  const loading = open && assets === null;

  useEffect(() => {
    if (!open || assets !== null) return;
    const supabase = createClient();
    supabase
      .from("media_assets")
      .select("*")
      .like("file_type", `${kind}/%`)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAssets(data ?? []));
  }, [open, assets, kind]);

  const pageCount = assets ? Math.max(1, Math.ceil(assets.length / PAGE_SIZE)) : 1;
  const pageAssets = (assets ?? []).slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-xs font-medium text-foreground/60">{label}</label>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="text-xs font-medium text-brand-ink hover:underline"
        >
          {open ? "Close" : "Browse library"}
        </button>
      </div>
      <input
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />

      {open && (
        <div className="mt-2 rounded-lg border border-border p-2">
          {loading && <p className="p-2 text-xs text-foreground/50">Loading...</p>}
          {!loading && assets?.length === 0 && (
            <p className="p-2 text-xs text-foreground/50">
              No {kind}s uploaded yet — add one from the Media Library page.
            </p>
          )}
          <div className="grid grid-cols-4 gap-2">
            {pageAssets.map((asset) => {
              const supabase = createClient();
              const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(asset.file_path);
              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => {
                    setValue(publicUrl.publicUrl);
                    setOpen(false);
                  }}
                  title={asset.file_name}
                  className="overflow-hidden rounded-md border border-border hover:border-brand"
                >
                  {kind === "video" ? (
                    <VideoThumb src={publicUrl.publicUrl} className="aspect-square w-full object-cover" />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={publicUrl.publicUrl}
                      alt={asset.alt_text ?? asset.file_name}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                </button>
              );
            })}
          </div>
          {assets && assets.length > PAGE_SIZE && (
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/70 hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                ← Prev
              </button>
              <span className="text-xs text-foreground/50">
                Page {page + 1} of {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={page >= pageCount - 1}
                className="rounded-md border border-border px-2 py-1 text-xs font-medium text-foreground/70 hover:border-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
