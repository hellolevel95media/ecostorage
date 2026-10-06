import { ButtonLink } from "@/components/ui/Button";
import type { SectionCopy } from "@/lib/fallback-content";

function parseBody(body?: string) {
  const lines = (body ?? "").split("\n").map((l) => l.trim()).filter(Boolean);
  const intro = lines.filter((l) => !l.startsWith("- ")).join(" ");
  const points = lines
    .filter((l) => l.startsWith("- "))
    .map((l) => {
      const text = l.slice(2);
      const i = text.indexOf(": ");
      return i > 0 ? { title: text.slice(0, i), text: text.slice(i + 2) } : { title: "", text };
    });
  return { intro, points };
}

export function TrustBanner({
  copy,
  showCta = true,
}: {
  copy: SectionCopy;
  showCta?: boolean;
}) {
  const ctaText = copy.cta_text ?? "Get a Free Quote";
  const ctaLink = copy.cta_link ?? "/contact";
  const { intro, points } = parseBody(copy.body);

  const cta = showCta && (
    <div className="mt-6">
      <ButtonLink href={ctaLink}>{ctaText}</ButtonLink>
    </div>
  );

  return (
    <section className="snap-section-flow mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface/60 px-6 py-8 shadow-card sm:px-10 sm:py-10">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-brand to-transparent"
        />
        {points.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-12">
            <div>
              <span aria-hidden className="block h-px w-12 bg-brand" />
              <h2 className="mt-5 text-2xl font-bold text-balance sm:text-3xl">{copy.heading}</h2>
              {intro && <p className="mt-4 text-foreground/70">{intro}</p>}
              {cta}
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {points.map((p) => (
                <li
                  key={p.title + p.text}
                  className="flex gap-3 rounded-xl border border-border bg-background/60 p-4"
                >
                  <span
                    aria-hidden
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand/15 text-brand-ink"
                  >
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="m4 10.5 4 4 8-9" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    {p.title && <p className="font-semibold">{p.title}</p>}
                    <p className="mt-1 text-sm text-foreground/70">{p.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center">
            <span aria-hidden className="mx-auto block h-px w-12 bg-brand" />
            <h2 className="mt-5 text-2xl font-bold text-balance sm:text-3xl">{copy.heading}</h2>
            {intro && <p className="mx-auto mt-4 max-w-2xl text-foreground/70">{intro}</p>}
            {cta}
          </div>
        )}
      </div>
    </section>
  );
}
