import { createServerSupabaseClient } from "@/lib/supabase/server";
import { MediaUploader } from "@/components/admin/MediaUploader";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const supabase = await createServerSupabaseClient();
  const { data: media } = await supabase
    .from("media_assets")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h2 className="text-xl font-semibold">Media library</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Upload images and video to Supabase Storage for use across service cards and banners.
      </p>

      <div className="mt-4">
        <MediaUploader />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {(media ?? []).map((asset) => {
          const { data: publicUrl } = supabase.storage.from("media").getPublicUrl(asset.file_path);
          return (
            <div key={asset.id} className="overflow-hidden rounded-xl border border-border bg-card">
              {asset.file_type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicUrl.publicUrl}
                  alt={asset.alt_text ?? asset.file_name}
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center bg-background text-xs text-foreground/50">
                  {asset.file_type}
                </div>
              )}
              <div className="flex items-center justify-between gap-2 p-3">
                <p className="truncate text-xs text-foreground/70">{asset.file_name}</p>
                <DeleteButton table="media_assets" id={asset.id} storagePath={asset.file_path} />
              </div>
            </div>
          );
        })}
        {(!media || media.length === 0) && (
          <p className="col-span-full text-sm text-foreground/50">No media uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
