import Link from "next/link";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustStats } from "@/components/sections/TrustStats";
import { StorageCalculator } from "@/components/sections/StorageCalculator";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { CardCarousel } from "@/components/ui/CardCarousel";
import { getPageSections, getPublishedArticles, getServices, resolveSection } from "@/lib/content";

export const revalidate = 60;

export default async function HomePage() {
  const [sections, services, articles] = await Promise.all([
    getPageSections("home"),
    getServices(),
    getPublishedArticles(3),
  ]);

  const hero = resolveSection(sections, "home", "hero");
  const trust = resolveSection(sections, "home", "trust_banner");

  return (
    <>
      <HeroBanner copy={hero} />
      <TrustStats copy={trust} />
      <StorageCalculator />

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Our services</h2>
          <Link href="/services" className="text-sm font-semibold text-brand-ink hover:underline">
            View all →
          </Link>
        </div>
        <CardCarousel className="mt-6" gridClassName="lg:grid-cols-2 xl:grid-cols-4">
          {services.slice(0, 4).map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </CardCarousel>
      </section>

      <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Resource library</h2>
          <Link href="/resources" className="text-sm font-semibold text-brand-ink hover:underline">
            Read more →
          </Link>
        </div>
        <CardCarousel className="mt-6" gridClassName="lg:grid-cols-2 xl:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </CardCarousel>
      </section>
    </>
  );
}
