import { TrustBanner } from "@/components/sections/TrustBanner";
import { ContactForm } from "@/components/sections/ContactForm";
import { getPageSections, resolveSection } from "@/lib/content";
import { COMPANY } from "@/lib/nav";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Get a Storage Quote in Singapore | Pickup & Delivery",
  description:
    "Tell us what you need to store and get a pickup-and-delivery quote in Singapore. Every enquiry gets a reply within one business day.",
  path: "/contact",
});

export default async function ContactPage() {
  const sections = await getPageSections("contact");
  const trust = resolveSection(sections, "contact", "trust_segment");

  return (
    <>
      <section className="snap-section-flow mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">Contact us</h1>
      </section>

      <TrustBanner copy={trust} showCta={false} />

      <section className="snap-section-flow mx-auto grid max-w-5xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:px-8">
        <div>
          <h2 className="text-xl font-semibold">Get in touch</h2>
          <address className="mt-4 space-y-2 text-sm text-foreground/70 not-italic">
            <p>{COMPANY.address}</p>
            <p>{COMPANY.email}</p>
            <p>{COMPANY.phone}</p>
          </address>
        </div>
        <ContactForm type="contact" title="Send a message" description="Short form — 500 words or less." />
      </section>
    </>
  );
}
