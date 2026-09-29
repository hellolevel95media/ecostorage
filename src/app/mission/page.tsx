import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Our Mission | Sustainable Storage | EcoStorage",
  description:
    "EcoStorage stores belongings in recycled-pallet, ambient-temperature crates instead of 24/7 air-conditioned units — a lower-carbon approach to self-storage in Singapore.",
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
