import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminServicesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: services } = await supabase
    .from("services")
    .select("*")
    .order("sort_order", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Services</h2>
        <ButtonLink href="/admin/services/new">New service</ButtonLink>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs text-foreground/50 uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(services ?? []).map((service) => (
              <tr key={service.id}>
                <td className="px-4 py-3 font-medium">{service.title}</td>
                <td className="px-4 py-3 capitalize text-foreground/70">{service.category}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton table="services" id={service.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(!services || services.length === 0) && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-foreground/50">
                  No services yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
