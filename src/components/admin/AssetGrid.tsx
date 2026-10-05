"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { VideoThumb } from "@/components/ui/VideoThumb";
import type { MediaAsset } from "@/types/database";

const PAGE_SIZE = 8;

/**
 * Paginated grid of uploaded media assets, shared by MediaPicker (pick one
 * into a dedicated field) and the article body's "Insert media" control
 * (pick one to insert at the cursor position).
 */
export function AssetGrid({
  kind,
  onPick,
}: {
  kind: "image" | "video" | "any";
  onPick: (url: string) => void;
}) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null);
  const [page, setPage] = useState(0);
  const loading = assets === null;

  useEffect(() => {
    const supabase = createClient();
    let query = supabase.from("media_assets").select("*");
    if (kind !== "any") {
      query = query.like("file_type", `${kind}/%`);
    }
    query.order("created_at", { ascending: false }).then(({ data }) => setAssets(data ?? []));
  }, [kind]);

  const pageCount = assets ? Math.max(1, Math.ceil(assets.length / PAGE_SIZE)) : 1;
  const pageAssets = (assets ?? []).slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  const emptyLabel = kind === "any" ? "files" : `${kind}s`;

  return (
    <div className="rounded-lg border border-border p-2">
      {loading && <p className="p-2 text-xs text-foreground/50">Loading...</p>}
      {!loading && assets?.length === 0 && (
        <p className="p-2 text-xs text-foreground/50">
          No {emptyLabel} uploaded yet — add one from the Media Library page.
        </p>
      )}
      <div className="grid grid-cols-4 gap-2">
        {pageAssets.map((asset) => {
          const supabase = createClient();
          const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(asset.file_path);
          const isVideo = asset.file_type.startsWith("video/");
          return (
            <button
              key={asset.id}
              type="button"
              onClick={() => onPick(publicUrl.publicUrl)}
              title={asset.file_name}
              className="overflow-hidden rounded-md border border-border hover:border-brand"
            >
              {isVideo ? (
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
  );
}
