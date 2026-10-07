import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Lower-Carbon Storage in Singapore | Ambient Warehousing",
  description:
    "Ambient-temperature warehousing and recycled pallets give you storage with a lower carbon footprint than 24/7 air-conditioned self-storage in Singapore.",
  path: "/mission",
});

export default async function MissionPage() {
  const sections = await getPageSections("mission");
  const hero = resolveSection(sections, "mission", "hero");
  const trust = resolveSection(sections, "mission", "trust_segment");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} />

      <section className="snap-section-flow mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ContactForm
          type="contact"
          title="Have a question about our mission?"
          description="Short form — 500 words or less."
        />
      </section>
    </>
  );
}
