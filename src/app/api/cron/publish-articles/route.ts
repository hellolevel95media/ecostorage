import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { pingIndexNow } from "@/lib/indexnow";

/**
 * Daily article queue. Scheduled articles are `draft` rows whose
 * `published_at` is the date they should go live. Each run publishes at most
 * ONE due draft (the oldest), so a missed day never dumps a backlog. Called by
 * Vercel Cron (vercel.json) with `Authorization: Bearer ${CRON_SECRET}`.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const given = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret ?? ""}`);
  if (!secret || secret.length < 16 || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: due, error } = await supabase
    .from("articles")
    .select("id, slug, locale")
    .eq("status", "draft")
    .not("published_at", "is", null)
    .lte("published_at", now)
    .order("published_at", { ascending: true })
    .limit(1);
  if (error) return NextResponse.json({ error: "Query failed" }, { status: 500 });

  const article = due?.[0];
  if (!article) return NextResponse.json({ published: null });

  // Re-check status in the update so two overlapping runs can't double-publish.
  const { data: updated, error: updateError } = await supabase
    .from("articles")
    .update({ status: "published", published_at: now })
    .eq("id", article.id)
    .eq("status", "draft")
    .select("slug");
  if (updateError) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  if (!updated?.length) return NextResponse.json({ published: null });

  const paths = ["/", "/personal", "/resources", `/resources/${article.slug}`, "/sitemap.xml", "/llms.txt"];
  if (article.locale === "zh") paths.push("/resources/zh");
  paths.forEach((p) => revalidatePath(p));
  await pingIndexNow([`/resources/${article.slug}`, "/resources", "/sitemap.xml"]);

  return NextResponse.json({ published: article.slug });
}
