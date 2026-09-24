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
}

/**
 * Empty visual placeholder used everywhere a real image/video would go.
 * Keeps media slots empty per project rules until real assets are uploaded
 * through the admin CMS.
 */
export function MediaPlaceholder({
  ratio = "video",
  label,
  kind = "image",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`skeleton relative flex w-full items-center justify-center overflow-hidden rounded-xl border border-border ${RATIO_CLASS[ratio]} ${className}`}
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
