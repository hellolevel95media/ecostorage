import type { Metadata } from "next";
import { ResourceFilterGrid } from "@/components/sections/ResourceFilterGrid";
import { getPageSections, getPublishedArticles, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Resource Library | EcoStorage",
};

export default async function ResourcesPage() {
  const [sections, articles] = await Promise.all([
    getPageSections("resources"),
    getPublishedArticles(),
  ]);

  const intro = resolveSection(sections, "resources", "intro");

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{intro.heading}</h1>
      {intro.subheading && <p className="mt-3 max-w-2xl text-foreground/70">{intro.subheading}</p>}

      <div className="mt-10">
        <ResourceFilterGrid articles={articles} />
      </div>
    </section>
  );
}
