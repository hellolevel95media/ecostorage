import Link from "next/link";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { StorageCalculator } from "@/components/sections/StorageCalculator";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { getPageSections, getPublishedArticles, getServices, resolveSection } from "@/lib/content";
import { buildMetadata } from "@/lib/site";

export const revalidate = 60;

export const metadata = buildMetadata({
  title: "Personal Storage Singapore | Pickup, Storage & Delivery | EcoStorage",
  description:
    "Book pickup-and-delivery storage for your home in Singapore — dorm move-outs, decluttering, and life transitions. No self-storage trips, flexible unit sizes.",
  path: "/personal",
});

export default async function PersonalPage() {
  const [sections, services, articles] = await Promise.all([
    getPageSections("personal"),
    getServices("personal"),
    getPublishedArticles(2),
  ]);

  const hero = resolveSection(sections, "personal", "hero");
  const trust = resolveSection(sections, "personal", "trust_segment");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustBanner copy={trust} />
      <StorageCalculator />

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Personal storage services</h2>
        <CardCarousel className="mt-6" gridClassName="lg:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </CardCarousel>
      </section>

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Related resources</h2>
          <Link href="/resources" className="text-sm font-semibold text-brand-ink hover:underline">
            View library →
          </Link>
        </div>
        <CardCarousel className="mt-6" gridClassName="lg:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardCarousel>
      </section>
    </>
  );
}
