import { ResourceFilterGrid } from "@/components/sections/ResourceFilterGrid";
import { getPublishedArticles } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "中文资源 | EcoStorage",
  description: "EcoStorage 新加坡上门存储服务的中文指南与文章。",
  path: "/resources/zh",
});

export default async function ChineseResourcesPage() {
  const articles = await getPublishedArticles(undefined, "zh");

  return (
    <section lang="zh" className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">中文资源</h1>
      <p className="mt-3 max-w-2xl text-foreground/70">
        EcoStorage 新加坡上门存取存储服务的中文指南，内容持续增加中。
      </p>

      <div className="mt-10">
        <ResourceFilterGrid
          articles={articles}
          allLabel="全部"
          byTopicLabel="分类"
          emptyMessage="中文文章即将推出，敬请期待。"
        />
      </div>
    </section>
  );
}
