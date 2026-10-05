"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/** Inline-editable grid position — type a number, tab or click away, and the
 * row re-sorts. Reusable across any table with a sort_order column. */
export function SortOrderInput({
  table,
  id,
  value,
}: {
  table: "services" | "sections";
  id: string;
  value: number;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(value);
  const [saving, setSaving] = useState(false);

  async function save() {
    if (current === value) return;
    setSaving(true);
    const supabase = createClient();
    await supabase.from(table).update({ sort_order: current }).eq("id", id);
    setSaving(false);
    router.refresh();
  }

  return (
    <input
      type="number"
      value={current}
      onChange={(e) => setCurrent(Number(e.target.value))}
      onBlur={save}
      disabled={saving}
      className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-sm outline-none focus:border-brand disabled:opacity-50"
    />
  );
}
