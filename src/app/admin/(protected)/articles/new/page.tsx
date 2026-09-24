import { ArticleForm } from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">New article</h2>
      <div className="mt-4">
        <ArticleForm />
      </div>
    </div>
  );
}
