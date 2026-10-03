import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";

export function HeroBanner({ copy }: { copy: SectionCopy }) {
  return (
    <section className="snap-section relative flex overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 hidden h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-brand/10 blur-[120px] lg:block"
      />

      {/* Mobile: full-bleed video with the copy overlaid near the bottom.
          Desktop: unchanged side-by-side grid layout. */}
      <div className="absolute inset-0 lg:hidden">
        <MediaPlaceholder
          ratio="video"
          kind="video"
          label="Hero video banner"
          src={copy.media_url}
          bleed
          className="h-full"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"
        />
      </div>

      <div className="relative flex w-full flex-1 flex-col justify-end px-4 pt-6 pb-10 sm:px-6 lg:mx-auto lg:max-w-7xl lg:grid lg:grid-cols-[2fr_3fr] lg:items-center lg:gap-10 lg:px-8 lg:pt-10 lg:pb-12">
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
        <MediaPlaceholder
          ratio="video"
          kind="video"
          label="Hero video banner"
          src={copy.media_url}
          className="hidden shadow-card lg:flex"
        />
      </div>
    </section>
  );
}
