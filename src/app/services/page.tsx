import type { Metadata } from "next";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ServicesFilterGrid } from "@/components/sections/ServicesFilterGrid";
import { getPageSections, getServices, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Services | EcoStorage",
};

export default async function ServicesPage() {
  const [sections, services] = await Promise.all([
    getPageSections("services"),
    getServices(),
  ]);

  const trust = resolveSection(sections, "services", "trust_segment");

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Services</h1>
        <p className="mt-3 max-w-2xl text-foreground/70">
          Personal and corporate storage solutions, tailored to how you work and live.
        </p>
      </section>

      <TrustBanner copy={trust} />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ServicesFilterGrid services={services} />
      </section>
    </>
  );
}
