"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const MAX_FILE_BYTES = 50 * 1024 * 1024; // keep in sync with the 'media'
// bucket's file_size_limit in supabase/migrations/04_media_bucket_limits.sql

export function MediaUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [altText, setAltText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_BYTES) {
      setError("File is too large — the media bucket accepts files up to 50MB.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setUploading(true);
    setError(null);

    const supabase = createClient();
    const path = `${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("media").upload(path, file);

    if (uploadError) {
      setUploading(false);
      setError(uploadError.message);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("media_assets").insert({
      file_name: file.name,
      file_path: path,
      file_type: file.type,
      file_size: file.size,
      alt_text: altText.trim() || null,
      uploaded_by: user?.id ?? null,
    });

    setUploading(false);
    setAltText("");
    if (inputRef.current) inputRef.current.value = "";

    if (insertError) {
      setError(insertError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
      <p className="text-sm text-foreground/70">Upload an image or video to the media bucket.</p>
      <input
        type="text"
        value={altText}
        onChange={(e) => setAltText(e.target.value)}
        placeholder="Alt text (for accessibility & SEO)"
        className="mx-auto mt-3 block w-full max-w-sm rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand"
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="mt-4">
        <Button type="button" disabled={uploading} onClick={() => inputRef.current?.click()}>
          {uploading ? "Uploading..." : "Choose file"}
        </Button>
      </div>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
    </div>
  );
}
