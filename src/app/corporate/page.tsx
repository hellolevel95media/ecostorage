import type { Metadata } from "next";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, getServices, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Corporate Storage | EcoStorage",
};

export default async function CorporatePage() {
  const [sections, services] = await Promise.all([
    getPageSections("corporate"),
    getServices("corporate"),
  ]);

  const hero = resolveSection(sections, "corporate", "hero");
  const trust = resolveSection(sections, "corporate", "trust_segment");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Corporate storage services</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ContactForm
          type="corporate"
          title="Request a corporate quote"
          description="Tell us about your business and storage needs — a member of our team will follow up."
          showCompanyFields
        />
      </section>
    </>
  );
}
