import Link from "next/link";
import { parseInline } from "@/lib/article-body";

/** Renders article text with [label](href) links. Internal paths use
 * next/link; external https links open in a new tab. */
export function InlineText({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((node, i) => {
        if (node.type === "text") return <span key={i}>{node.text}</span>;
        const className = "font-semibold text-brand-ink underline underline-offset-2 hover:no-underline";
        return node.href.startsWith("/") ? (
          <Link key={i} href={node.href} className={className}>
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
