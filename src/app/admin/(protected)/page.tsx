import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function getCounts() {
  const supabase = await createServerSupabaseClient();
  const [articles, services, inquiries, media] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("services").select("id", { count: "exact", head: true }),
    supabase.from("inquiries").select("id", { count: "exact", head: true }),
    supabase.from("media_assets").select("id", { count: "exact", head: true }),
  ]);

  return {
    articles: articles.count ?? 0,
    services: services.count ?? 0,
    inquiries: inquiries.count ?? 0,
    media: media.count ?? 0,
  };
}

export default async function AdminDashboardPage() {
  const counts = await getCounts();

  const cards = [
    { label: "Articles", value: counts.articles, href: "/admin/articles" },
    { label: "Services", value: counts.services, href: "/admin/services" },
    { label: "Inquiries", value: counts.inquiries, href: "/admin/inquiries" },
    { label: "Media assets", value: counts.media, href: "/admin/media" },
  ];

  return (
    <div>
      <h2 className="text-xl font-semibold">Overview</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-xl border border-white/10 bg-card p-5 hover:border-brand/40"
          >
            <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-bold text-brand">{card.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
