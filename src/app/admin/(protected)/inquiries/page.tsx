import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { DeleteButton } from "@/components/admin/DeleteButton";
import type { PartnerKind } from "@/types/database";

export const dynamic = "force-dynamic";

const PARTNER_KIND_LABELS: Record<PartnerKind, string> = {
  affiliate: "Affiliate",
  business: "Business",
};

export default async function AdminInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerKind?: string }>;
}) {
  const { partnerKind } = await searchParams;
  const isValidFilter = partnerKind === "affiliate" || partnerKind === "business";

  const supabase = await createServerSupabaseClient();
  let query = supabase.from("inquiries").select("*").order("created_at", { ascending: false });
  if (isValidFilter) {
    query = query.eq("metadata->>partnerKind", partnerKind);
  }
  const { data: inquiries } = await query;

  const rows = inquiries ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inquiries</h2>
        <ExportCsvButton inquiries={rows} />
      </div>

      <div className="mt-3 flex gap-2 text-xs font-medium">
        <FilterTab href="/admin/inquiries" active={!isValidFilter} label="All" />
        <FilterTab
          href="/admin/inquiries?partnerKind=affiliate"
          active={partnerKind === "affiliate"}
          label="Affiliates"
        />
        <FilterTab
          href="/admin/inquiries?partnerKind=business"
          active={partnerKind === "business"}
          label="Business partners"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs text-foreground/50 uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Partner kind</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((inquiry) => {
              const kind = inquiry.metadata?.partnerKind as PartnerKind | undefined;
              return (
                <tr key={inquiry.id}>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground/60">
                    {new Date(inquiry.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 capitalize">{inquiry.type}</td>
                  <td className="px-4 py-3 text-foreground/70">{kind ? PARTNER_KIND_LABELS[kind] : "—"}</td>
                  <td className="px-4 py-3 font-medium">{inquiry.name}</td>
                  <td className="px-4 py-3 text-foreground/70">{inquiry.email}</td>
                  <td className="max-w-xs truncate px-4 py-3 text-foreground/70">
                    {inquiry.message ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton table="inquiries" id={inquiry.id} confirmLabel="Delete this inquiry?" />
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-foreground/50">
                  No inquiries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterTab({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 ${
        active
          ? "border-brand bg-brand/10 text-brand-ink"
          : "border-border text-foreground/60 hover:border-brand/40"
      }`}
    >
      {label}
    </Link>
  );
}
