import Link from "next/link";
import { MANAGED_PAGES } from "@/lib/nav";

export default function AdminPagesPage() {
  return (
    <div>
      <h2 className="text-xl font-semibold">Page copy</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Edit headline text, mission statements, and section copy for each page.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {MANAGED_PAGES.map((page) => (
          <Link
            key={page.slug}
            href={`/admin/pages/${page.slug}`}
            className="rounded-xl border border-white/10 bg-card p-4 hover:border-brand/40"
          >
            <p className="font-medium">{page.title}</p>
            <p className="mt-1 text-xs text-foreground/50">/{page.slug === "home" ? "" : page.slug}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
