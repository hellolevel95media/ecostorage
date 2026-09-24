import type { Metadata } from "next";
import Link from "next/link";
import { HeroBanner } from "@/components/sections/HeroBanner";
import { TrustBanner } from "@/components/sections/TrustBanner";
import { StorageCalculator } from "@/components/sections/StorageCalculator";
import { ServiceCard } from "@/components/sections/ServiceCard";
import { ArticleCard } from "@/components/sections/ArticleCard";
import { getPageSections, getPublishedArticles, getServices, resolveSection } from "@/lib/content";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Personal Storage | EcoStorage",
};

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

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Personal storage services</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <h2 className="text-2xl font-bold sm:text-3xl">Related resources</h2>
          <Link href="/resources" className="text-sm font-semibold text-brand hover:underline">
            View library →
          </Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </>
  );
}
