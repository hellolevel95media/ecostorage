"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaAsset } from "@/types/database";

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
        <div className="mt-2 max-h-64 overflow-y-auto rounded-lg border border-border p-2">
          {loading && <p className="p-2 text-xs text-foreground/50">Loading...</p>}
          {!loading && assets?.length === 0 && (
            <p className="p-2 text-xs text-foreground/50">
              No {kind}s uploaded yet — add one from the Media Library page.
            </p>
          )}
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {(assets ?? []).map((asset) => {
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
                  className="overflow-hidden rounded-md border border-border hover:border-brand"
                >
                  {kind === "video" ? (
                    <video
                      src={publicUrl.publicUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      className="aspect-square w-full object-cover"
                    />
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
        </div>
      )}
    </div>
  );
}
