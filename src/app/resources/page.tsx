import { ResourceFilterGrid } from "@/components/sections/ResourceFilterGrid";
import { getPageSections, getPublishedArticles, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Resource Library | Storage Guides | EcoStorage",
  description:
    "Guides on packing, records retention, and climate-controlled storage from EcoStorage's Singapore pickup-and-delivery storage specialists.",
  path: "/resources",
});

export default async function ResourcesPage() {
  const [sections, articles] = await Promise.all([
    getPageSections("resources"),
    getPublishedArticles(),
  ]);

  const intro = resolveSection(sections, "resources", "intro");

  return (
    <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{intro.heading}</h1>
      {intro.subheading && <p className="mt-3 max-w-2xl text-foreground/70">{intro.subheading}</p>}

      <div className="mt-10">
        <ResourceFilterGrid articles={articles} />
      </div>
    </section>
  );
}
