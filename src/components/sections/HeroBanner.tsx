import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";

export function HeroBanner({ copy }: { copy: SectionCopy }) {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 pt-14 pb-16 sm:px-6 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16 lg:px-8 lg:pt-20 lg:pb-24">
        <div className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
            {copy.heading}
          </h1>
          {copy.subheading && (
            <p className="mt-5 max-w-xl text-base text-foreground/70 sm:text-lg">
              {copy.subheading}
            </p>
          )}
          {copy.cta_text && (
            <div className="mt-8">
              <ButtonLink href={copy.cta_link ?? "/contact"}>{copy.cta_text}</ButtonLink>
            </div>
          )}
        </div>
        <MediaPlaceholder ratio="video" kind="video" label="Hero video banner" className="shadow-card" />
      </div>
    </section>
  );
}
