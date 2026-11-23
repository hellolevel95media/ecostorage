import Link from "next/link";
import { parseInline } from "@/lib/article-body";

/**
 * Tags an internal `?promo=` link with `src=<article slug>` so the calculator
 * can credit the article. next/link navigates client-side, which leaves
 * `document.referrer` pointing at the page before the article (often Google),
 * so the referrer alone can't be trusted for this.
 */
function withArticleSource(href: string, articleSlug?: string): string {
  if (!articleSlug) return href;
  const hashAt = href.indexOf("#");
  const hash = hashAt === -1 ? "" : href.slice(hashAt);
  const beforeHash = hashAt === -1 ? href : href.slice(0, hashAt);
  const queryAt = beforeHash.indexOf("?");
  if (queryAt === -1) return href;
  const params = new URLSearchParams(beforeHash.slice(queryAt + 1));
  if (!params.has("promo") || params.has("src")) return href;
  params.set("src", articleSlug);
  return `${beforeHash.slice(0, queryAt)}?${params.toString()}${hash}`;
}

/** Renders article text with [label](href) links. Internal paths use
 * next/link; external https links open in a new tab. */
export function InlineText({ text, articleSlug }: { text: string; articleSlug?: string }) {
  return (
    <>
      {parseInline(text).map((node, i) => {
        if (node.type === "text") return <span key={i}>{node.text}</span>;
        const className = "font-semibold text-brand-ink underline underline-offset-2 hover:no-underline";
        return node.href.startsWith("/") ? (
          <Link key={i} href={withArticleSource(node.href, articleSlug)} className={className}>
            {node.text}
          </Link>
        ) : (
          <a key={i} href={node.href} className={className} target="_blank" rel="noopener noreferrer">
            {node.text}
          </a>
        );
      })}
    </>
  );
}
