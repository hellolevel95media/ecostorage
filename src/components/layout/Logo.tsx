import Link from "next/link";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-brand-foreground">
        E
      </span>
      <span>
        <span className="text-brand-ink">Eco</span>Storage
      </span>
    </Link>
  );
}
