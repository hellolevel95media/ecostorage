import { MediaPlaceholder } from "@/components/ui/MediaPlaceholder";
import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";

export function HeroBanner({ copy }: { copy: SectionCopy }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-white/10 bg-card p-6 sm:p-10">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">{copy.heading}</h1>
          {copy.subheading && (
            <p className="mt-4 text-base text-foreground/70 sm:text-lg">{copy.subheading}</p>
          )}
          {copy.cta_text && (
            <div className="mt-6">
              <ButtonLink href={copy.cta_link ?? "/contact"}>{copy.cta_text}</ButtonLink>
            </div>
          )}
        </div>
        <div className="mt-8">
          <MediaPlaceholder ratio="wide" kind="video" label="Hero video banner" />
        </div>
      </div>
    </section>
  );
}
