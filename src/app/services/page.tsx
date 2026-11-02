import { TrustBanner } from "@/components/sections/TrustBanner";
import { ServicesFilterGrid } from "@/components/sections/ServicesFilterGrid";
import { MovingBanner } from "@/components/sections/MovingBanner";
import { getPageSections, getServices, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Storage & Moving Services Singapore | Pickup, Delivery & Records",
  description:
    "Storage and moving from one team: pickup, storage, delivery, home and office moves, records and inventory storage. S$350 per full 14ft truckload.",
  path: "/services",
});

export default async function ServicesPage() {
  const [sections, services] = await Promise.all([
    getPageSections("services"),
    getServices(),
  ]);

  const trust = resolveSection(sections, "services", "trust_segment");
  const moving = resolveSection(sections, "services", "moving");

  return (
    <>
      <section className="snap-section-flow mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Services</h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Personal and corporate storage, with collection and moving handled by the same team.
        </p>
      </section>

      <TrustBanner copy={trust} />

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ServicesFilterGrid services={services} />
      </section>

      <MovingBanner copy={moving} />
    </>
  );
}
