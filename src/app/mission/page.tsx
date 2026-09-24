import type { Metadata } from "next";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Mission | EcoStorage",
};

export default async function MissionPage() {
  const sections = await getPageSections("mission");
  const hero = resolveSection(sections, "mission", "hero");
  const trust = resolveSection(sections, "mission", "trust_segment");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} />

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ContactForm
          type="contact"
          title="Have a question about our mission?"
          description="Short form — 500 words or less."
        />
      </section>
    </>
  );
}
