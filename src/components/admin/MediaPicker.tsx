"use client";

import { useState } from "react";
import { AssetGrid } from "@/components/admin/AssetGrid";

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
  /** Which uploaded assets to offer. "any" browses images and video
   * together (e.g. a banner that could be either) — otherwise filters the
   * media library query to just one type, not just the UI. */
  kind?: "image" | "video" | "any";
}) {
  const [value, setValue] = useState(defaultValue ?? "");
  const [open, setOpen] = useState(false);

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
        <div className="mt-2">
          <AssetGrid
            kind={kind}
            onPick={(url) => {
              setValue(url);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
