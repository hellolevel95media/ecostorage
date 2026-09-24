import type { Metadata } from "next";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Be a Partner | EcoStorage",
};

export default async function PartnerPage() {
  const sections = await getPageSections("partner");
  const hero = resolveSection(sections, "partner", "hero");
  const trust = resolveSection(sections, "partner", "trust_segment");
  const referral = resolveSection(sections, "partner", "referral_intro");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} />

      <section className="mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">{referral.heading}</h2>
        {referral.body && <p className="mt-3 text-foreground/70">{referral.body}</p>}
      </section>

      <section id="partner-form" className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ContactForm
          type="partner"
          title="Apply to become a partner"
          description="Share a few details and our partnerships team will reach out."
          showCompanyFields
        />
      </section>
    </>
  );
}
