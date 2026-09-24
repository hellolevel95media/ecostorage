import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";

export function TrustBanner({
  copy,
  showCta = true,
}: {
  copy: SectionCopy;
  showCta?: boolean;
}) {
  const ctaText = copy.cta_text ?? "Get a Free Quote";
  const ctaLink = copy.cta_link ?? "/contact";

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 px-6 py-12 text-center shadow-card sm:px-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent"
        />
        <span aria-hidden className="mx-auto block h-px w-12 bg-brand" />
        <h2 className="mt-6 text-2xl font-bold text-balance sm:text-3xl">{copy.heading}</h2>
        {copy.body && <p className="mx-auto mt-4 max-w-2xl text-foreground/70">{copy.body}</p>}
        {showCta && (
          <div className="mt-8">
            <ButtonLink href={ctaLink}>{ctaText}</ButtonLink>
          </div>
        )}
      </div>
    </section>
  );
}
