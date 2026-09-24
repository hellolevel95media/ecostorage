import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ServiceForm } from "@/components/admin/ServiceForm";

export const dynamic = "force-dynamic";

export default async function EditServicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: service } = await supabase.from("services").select("*").eq("id", id).maybeSingle();

  if (!service) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold">Edit service</h2>
      <div className="mt-4">
        <ServiceForm service={service} />
      </div>
    </div>
  );
}
