import { SITE_URL } from "@/lib/site";
import { getPublishedArticles } from "@/lib/content";
import { LLMS_BASE } from "@/lib/llms-base";

// Hourly refresh so newly published articles show up without a redeploy.
export const revalidate = 3600;

/** /llms.txt for AI crawlers: the hand-written summary plus a live list of English articles. */
export async function GET() {
  const articles = await getPublishedArticles();
  const lines = articles.map(
    (a) => `- [${a.title}](${SITE_URL}/resources/${a.slug})${a.excerpt ? `: ${a.excerpt}` : ""}`
  );
  const body = lines.length ? `${LLMS_BASE}\n\n## Articles\n\n${lines.join("\n")}\n` : `${LLMS_BASE}\n`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
