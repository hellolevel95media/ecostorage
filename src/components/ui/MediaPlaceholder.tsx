import { VideoThumb } from "@/components/ui/VideoThumb";

type Ratio = "video" | "square" | "wide" | "portrait";

const RATIO_CLASS: Record<Ratio, string> = {
  video: "aspect-video",
  square: "aspect-square",
  wide: "aspect-[21/9]",
  portrait: "aspect-[3/4]",
};

interface MediaPlaceholderProps {
  ratio?: Ratio;
  label?: string;
  kind?: "image" | "video";
  className?: string;
  /** Fills the parent instead of enforcing its own aspect ratio — used for
   * full-bleed mobile hero backgrounds where the parent section controls height. */
  bleed?: boolean;
  /** Public URL of an uploaded asset. When set, renders the real
   * image/video instead of the empty skeleton. All site video is muted,
   * looping, autoplaying background footage — never user-controlled audio. */
  src?: string | null;
}

/**
 * Renders real uploaded media when `src` is set; otherwise falls back to an
 * empty skeleton placeholder (project rule: never hardcode static media,
 * only ever source it from the admin CMS).
 */
export function MediaPlaceholder({
  ratio = "video",
  label,
  kind = "image",
  className = "",
  bleed = false,
  src,
}: MediaPlaceholderProps) {
  const shapeClass = bleed ? "h-full rounded-none" : `rounded-xl ${RATIO_CLASS[ratio]}`;

  if (src) {
    return (
      <div className={`relative w-full overflow-hidden border border-border ${shapeClass} ${className}`}>
        {kind === "video" ? (
          <VideoThumb src={src} className="h-full w-full object-cover" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={label ?? ""} className="h-full w-full object-cover" />
        )}
      </div>
    );
  }

  return (
    <div
      className={`skeleton relative flex w-full items-center justify-center overflow-hidden border border-border ${shapeClass} ${className}`}
      role="img"
      aria-label={label ?? "Media placeholder"}
    >
      <span className="flex items-center gap-2 text-xs font-medium tracking-wide text-foreground/30 uppercase">
        {kind === "video" ? <PlayIcon /> : <ImageIcon />}
        {label ?? (kind === "video" ? "Video" : "Image")}
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}
