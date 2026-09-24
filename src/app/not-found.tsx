import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <p className="text-sm font-semibold tracking-wide text-brand uppercase">404</p>
      <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
      <p className="mt-3 text-foreground/70">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <ButtonLink href="/" className="mt-6">
        Back to home
      </ButtonLink>
    </section>
  );
}
