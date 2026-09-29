import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ContactForm } from "@/components/sections/ContactForm";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { getPageSections, getServices, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Corporate Storage Singapore | Records & Inventory Management | EcoStorage",
  description:
    "Pickup-and-delivery storage for businesses in Singapore — document/records archiving, inventory and pallet storage, with account management for teams.",
  path: "/corporate",
});

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

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Corporate storage services</h2>
        <CardCarousel className="mt-6" gridClassName="lg:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </CardCarousel>
      </section>

      <section className="snap-section-flow mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
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
