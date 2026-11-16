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
        <p className="mt-3 text-sm font-medium text-foreground/70">
          Two different programmes. Pick the one that fits you, then fill in that form only.
        </p>
      </section>

      <div className="snap-section-flow mx-auto grid max-w-6xl items-start gap-6 px-4 pb-12 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8">
        {/* Affiliate: individuals who refer customers (handled by the affiliate system). */}
        <section
          id="affiliate-form"
          aria-labelledby="affiliate-heading"
          className="relative scroll-mt-24 overflow-hidden rounded-2xl border border-brand/50 bg-card p-6 shadow-card sm:p-8"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-brand" />
          <p className="inline-block rounded-full bg-brand/15 px-3 py-1 text-xs font-semibold tracking-wide text-brand-ink uppercase">
            Option 1 · Individuals
          </p>
          <h2 id="affiliate-heading" className="mt-3 text-2xl font-bold sm:text-3xl">
            Earn by referring customers
            <span className="mt-1 block text-base font-semibold text-brand-ink sm:text-lg">Affiliate programme</span>
          </h2>
          <p className="mt-3 text-sm text-foreground/70">
            For anyone who wants to recommend EcoStorage to friends, family or followers and earn rewards for the
            customers they bring. We review every application personally and email you the next steps.
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            Running a business instead?{" "}
            <a href="#partner-form" className="font-medium text-brand-ink underline underline-offset-2">
              Use the business partnership form
            </a>
            .
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <AffiliateApplicationForm bare />
          </div>
        </section>

        {/* Business partnership: stays on the website (inquiries). */}
        <section
          id="partner-form"
          aria-labelledby="partner-heading"
          className="relative scroll-mt-24 overflow-hidden rounded-2xl border border-foreground/25 bg-card p-6 shadow-card sm:p-8"
        >
          <div aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-foreground" />
          <p className="inline-block rounded-full bg-foreground px-3 py-1 text-xs font-semibold tracking-wide text-background uppercase">
            Option 2 · Businesses
          </p>
          <h2 id="partner-heading" className="mt-3 text-2xl font-bold sm:text-3xl">
            Business partnerships
            <span className="mt-1 block text-base font-semibold text-foreground/70 sm:text-lg">
              Movers, property managers, companies
            </span>
          </h2>
          <p className="mt-3 text-sm text-foreground/70">
            For moving companies, property managers, agents and other businesses that want to work with us. Share a few
            details and our partnerships team will reach out.
          </p>
          <p className="mt-2 text-sm text-foreground/70">
            Just want to refer people and earn rewards?{" "}
            <a href="#affiliate-form" className="font-medium text-brand-ink underline underline-offset-2">
              Use the affiliate form
            </a>
            .
          </p>
          <div className="mt-6 border-t border-border pt-6">
            <ContactForm
              type="partner"
              title=""
              showCompanyFields
              metadata={{ partnerKind: "business" }}
              bare
              submitLabel="Send partnership enquiry"
              submitVariant="dark"
            />
          </div>
        </section>
      </div>
    </>
  );
}
