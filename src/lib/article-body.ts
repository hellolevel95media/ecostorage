/**
 * Marker syntax an admin can type (or, more commonly, that the "Insert
 * media" button in ArticleForm inserts for them) to place an image or
 * video between paragraphs: a line containing only [[media:<url>]].
 * Keeps article bodies as plain text (matching the existing DB column and
 * public-page rendering) while still allowing inline media, instead of
 * requiring a full rich-text/block editor.
 */
const MEDIA_MARKER = /^\[\[media:(.+)\]\]$/;

export type ArticleBodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "list"; items: string[] }
  | { type: "media"; url: string };

export function parseArticleBody(body: string): ArticleBodyBlock[] {
  return body
    .split("\n\n")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const match = chunk.match(MEDIA_MARKER);
      if (match) return { type: "media" as const, url: match[1] };
      if (chunk.startsWith("## ") && !chunk.includes("\n")) return { type: "heading" as const, text: chunk.slice(3).trim() };
      const lines = chunk.split("\n").map((l) => l.trim());
      if (lines.every((l) => l.startsWith("- "))) return { type: "list" as const, items: lines.map((l) => l.slice(2).trim()) };
      return { type: "paragraph" as const, text: chunk };
    });
}

export function mediaMarker(url: string): string {
  return `[[media:${url}]]`;
}
