/**
 * Marker syntax an admin can type (or, more commonly, that the "Insert
 * media" button in ArticleForm inserts for them) to place an image or
 * video between paragraphs: a line containing only [[media:<url>]].
 * Keeps article bodies as plain text (matching the existing DB column and
 * public-page rendering) while still allowing inline media, instead of
 * requiring a full rich-text/block editor.
 *
 * Other supported syntax:
 *   "## Heading"      section heading (h2)
 *   "### Question?"   subheading (h3); under an "## Frequently asked
 *                     questions" heading these become FAQPage JSON-LD
 *   "- item" lines    bullet list
 *   [text](/path)     inline link (internal paths or https:// only)
 */
const MEDIA_MARKER = /^\[\[media:(.+)\]\]$/;
const LINK_PATTERN = /\[([^\]\n]+)\]\(([^)\s]+)\)/g;
const FAQ_HEADING = /^(frequently asked questions|faqs?|常见问题)/i;

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "subheading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "media"; url: string };

export type InlineNode = { type: "text"; text: string } | { type: "link"; text: string; href: string };

export interface FaqItem {
  question: string;
  answer: string;
}

export function parseArticleBody(body: string): ArticleBodyBlock[] {
  return body
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(MEDIA_MARKER);
      if (match) return { type: "media" as const, url: match[1] };
      if (chunk.startsWith("### ") && !chunk.includes("\n")) return { type: "subheading" as const, text: chunk.slice(4).trim() };
      if (chunk.startsWith("## ") && !chunk.includes("\n")) return { type: "heading" as const, text: chunk.slice(3).trim() };
      const lines = chunk.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) return { type: "list" as const, items: lines.map((l) => l.slice(2).trim()) };
      return { type: "paragraph" as const, text: chunk };
    });
}

/** Only site-relative paths and https URLs become links; anything else
 * (javascript:, data:, protocol-relative) is left as plain text. */
function isSafeHref(href: string): boolean {
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("https://");
}

export function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_PATTERN)) {
    const [full, label, href] = m;
    const start = m.index ?? 0;
    if (!isSafeHref(href)) continue;
    if (start > last) nodes.push({ type: "text", text: text.slice(last, start) });
    nodes.push({ type: "link", text: label, href });
    last = start + full.length;
  }
  if (last < text.length) nodes.push({ type: "text", text: text.slice(last) });
  return nodes;
}

/** Link markup removed, for plain-text uses (JSON-LD, meta tags). */
export function stripInline(text: string): string {
  return text.replace(LINK_PATTERN, "$1");
}

/** Q&A pairs from an "## Frequently asked questions" section: each
 * "### Question?" subheading plus the paragraphs/lists until the next one. */
export function extractFaq(blocks: ArticleBodyBlock[]): FaqItem[] {
  const start = blocks.findIndex((b) => b.type === "heading" && FAQ_HEADING.test(b.text));
  if (start === -1) return [];
  const faq: FaqItem[] = [];
  let current: { question: string; parts: string[] } | null = null;
  const flush = () => {
    if (current && current.parts.length) faq.push({ question: current.question, answer: current.parts.join(" ") });
  };
  for (const block of blocks.slice(start + 1)) {
    if (block.type === "heading") break;
    if (block.type === "subheading") {
      flush();
      current = { question: block.text, parts: [] };
    } else if (current && block.type === "paragraph") {
      current.parts.push(stripInline(block.text));
    } else if (current && block.type === "list") {
      current.parts.push(block.items.map(stripInline).join("; "));
    }
  }
  flush();
  return faq;
}

export function mediaMarker(url: string): string {
  return `[[media:${url}]]`;
}
