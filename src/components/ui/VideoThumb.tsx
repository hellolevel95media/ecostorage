"use client";

/**
 * Muted, looping autoplay video thumbnail. Sets `.muted` imperatively via a
 * ref — React's `muted` JSX attribute doesn't reliably apply before the
 * browser's autoplay permission check runs (a long-standing React/DOM quirk),
 * so `autoPlay` silently fails and the element just renders a blank frame
 * unless the property is set directly on the DOM node.
 */
export function VideoThumb({ src, className }: { src: string; className?: string }) {
  return (
    <video
      ref={(el) => {
        if (el) el.muted = true;
      }}
      src={src}
      loop
      autoPlay
      playsInline
      muted
      className={className}
    />
  );
}
