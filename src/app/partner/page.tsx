import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { AffiliateApplicationForm } from "@/components/sections/AffiliateApplicationForm";
import { getPageSections, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Storage Referral Partners | Agents & Property Managers",
  description:
    "Refer clients to a pickup-and-delivery storage service in Singapore. Built for real estate agents, property managers and moving companies.",
  path: "/partner",
});

export default async function PartnerPage() {
  const sections = await getPageSections("partner");
  const hero = resolveSection(sections, "partner", "hero");
  const trust = resolveSection(sections, "partner", "trust_segment");
  const referral = resolveSection(sections, "partner", "referral_intro");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} showCta={false} />

      <section className="snap-section-flow mx-auto max-w-3xl px-4 py-10 text-center sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">{referral.heading}</h2>
        {referral.body && <p className="mt-3 text-foreground/70">{referral.body}</p>}
      </section>

      {/* Path picker — two static anchor links, no client JS needed to reach
          either form below. */}
      <section className="snap-section-flow mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="#affiliate-form"
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
          >
            <p className="text-xs font-semibold tracking-wide text-brand-ink uppercase">Individuals</p>
            <h3 className="mt-1 text-lg font-semibold">Become an affiliate</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Refer friends and family and earn rewards for every customer you bring us.
            </p>
          </a>
          <a
            href="#partner-form"
            className="rounded-xl border border-border bg-card p-6 transition-colors hover:border-brand/40"
          >
            <p className="text-xs font-semibold tracking-wide text-brand-ink uppercase">Businesses</p>
            <h3 className="mt-1 text-lg font-semibold">Partner with us</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Movers, property agents, and other businesses looking for a referral partnership.
            </p>
          </a>
        </div>
      </section>

      <section id="affiliate-form" className="snap-section-flow mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <AffiliateApplicationForm />
      </section>

      <section id="partner-form" className="snap-section-flow mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <ContactForm
          type="partner"
          title="Business partnership enquiry"
          description="Share a few details and our partnerships team will reach out."
          showCompanyFields
          metadata={{ partnerKind: "business" }}
        />
      </section>
    </>
  );
}
