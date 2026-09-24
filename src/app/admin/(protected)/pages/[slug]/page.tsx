import { notFound } from "next/navigation";
import { SectionEditor } from "@/components/admin/SectionEditor";
import { getPageSections, resolveSection } from "@/lib/content";
import { FALLBACK_SECTIONS } from "@/lib/fallback-content";
import { MANAGED_PAGES } from "@/lib/nav";

export const dynamic = "force-dynamic";

export default async function AdminPageEditor({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = MANAGED_PAGES.find((p) => p.slug === slug);
  if (!page) notFound();

  const sections = await getPageSections(slug);
  const dbKeys = sections.map((s) => s.section_key);
  const fallbackKeys = Object.keys(FALLBACK_SECTIONS[slug] ?? {});
  const sectionKeys = Array.from(new Set([...fallbackKeys, ...dbKeys]));

  return (
    <div>
      <h2 className="text-xl font-semibold">{page.title}</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Edit copy for each section on this page. Changes appear live once saved.
      </p>

      <div className="mt-4 space-y-4">
        {sectionKeys.map((key) => (
          <SectionEditor
            key={key}
            pageSlug={slug}
            pageTitle={page.title}
            sectionKey={key}
            initial={resolveSection(sections, slug, key)}
          />
        ))}
      </div>
    </div>
  );
}
