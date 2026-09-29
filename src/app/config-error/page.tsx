import { ButtonLink } from "@/components/ui/Button";

export const metadata = {
  title: "Configuration Error | EcoStorage",
  robots: { index: false, follow: false },
};

export default function ConfigErrorPage() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-brand-ink uppercase">
        Setup incomplete
      </p>
      <h1 className="mt-2 text-3xl font-bold">Admin isn&apos;t connected yet</h1>
      <p className="mt-3 text-foreground/70">
        The Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL /
        NEXT_PUBLIC_SUPABASE_ANON_KEY) aren&apos;t set, so the admin CMS can&apos;t
        authenticate. Add them to .env.local and restart the server — see
        todo.txt for the exact steps.
      </p>
      <ButtonLink href="/" className="mt-6">
        Back to home
      </ButtonLink>
    </section>
  );
}
