import type { SectionCopy } from "@/lib/fallback-content";

export function TrustBanner({ copy }: { copy: SectionCopy }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6 text-center sm:p-10">
        <h2 className="text-2xl font-bold sm:text-3xl">{copy.heading}</h2>
        {copy.body && <p className="mx-auto mt-3 max-w-2xl text-foreground/70">{copy.body}</p>}
      </div>
    </section>
  );
}
