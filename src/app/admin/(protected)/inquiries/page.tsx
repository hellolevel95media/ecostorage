import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExportCsvButton } from "@/components/admin/ExportCsvButton";
import { DeleteButton } from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = inquiries ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Inquiries</h2>
        <ExportCsvButton inquiries={rows} />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs text-foreground/50 uppercase">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((inquiry) => (
              <tr key={inquiry.id}>
                <td className="px-4 py-3 whitespace-nowrap text-foreground/60">
                  {new Date(inquiry.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 capitalize">{inquiry.type}</td>
                <td className="px-4 py-3 font-medium">{inquiry.name}</td>
                <td className="px-4 py-3 text-foreground/70">{inquiry.email}</td>
                <td className="max-w-xs truncate px-4 py-3 text-foreground/70">
                  {inquiry.message ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteButton table="inquiries" id={inquiry.id} confirmLabel="Delete this inquiry?" />
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-foreground/50">
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
