"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function DeleteButton({
  table,
  id,
  storagePath,
  confirmLabel = "Delete this item?",
}: {
  table: "articles" | "services" | "media_assets" | "inquiries";
  id: string;
  storagePath?: string;
  confirmLabel?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmLabel)) return;
    setLoading(true);
    const supabase = createClient();
    if (storagePath) {
      await supabase.storage.from("media").remove([storagePath]);
    }
    await supabase.from(table).delete().eq("id", id);
    setLoading(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-red-500 hover:underline disabled:opacity-50"
    >
      {loading ? "Deleting..." : "Delete"}
    </button>
  );
}
