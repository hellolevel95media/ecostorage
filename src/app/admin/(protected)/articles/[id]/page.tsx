import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ArticleForm } from "@/components/admin/ArticleForm";

export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: article } = await supabase.from("articles").select("*").eq("id", id).maybeSingle();

  if (!article) notFound();

  return (
    <div>
      <h2 className="text-xl font-semibold">Edit article</h2>
      <div className="mt-4">
        <ArticleForm article={article} />
      </div>
    </div>
  );
}
