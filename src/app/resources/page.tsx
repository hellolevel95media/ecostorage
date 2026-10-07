import { ResourceFilterGrid } from "@/components/sections/ResourceFilterGrid";
import { getPageSections, getPublishedArticles, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Storage & Moving Guides for Singapore | HIP, Packing & More",
  description:
    "Practical guides on HDB HIP preparation, packing fragile items, long-term storage and moving between rentals in Singapore.",
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
