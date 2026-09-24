import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { ButtonLink } from "@/components/ui/Button";

export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const supabase = await createServerSupabaseClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Articles</h2>
        <ButtonLink href="/admin/articles/new">New article</ButtonLink>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs text-foreground/50 uppercase">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {(articles ?? []).map((article) => (
              <tr key={article.id}>
                <td className="px-4 py-3 font-medium">{article.title}</td>
                <td className="px-4 py-3 capitalize text-foreground/70">{article.status}</td>
                <td className="px-4 py-3 text-foreground/70">{article.category ?? "—"}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-4">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-sm font-medium text-brand hover:underline"
                    >
                      Edit
                    </Link>
                    <DeleteButton table="articles" id={article.id} />
                  </div>
                </td>
              </tr>
            ))}
            {(!articles || articles.length === 0) && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-foreground/50">
                  No articles yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
