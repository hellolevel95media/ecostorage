const VIDEO_EXTENSIONS = [".mp4", ".webm", ".mov", ".m4v"];

/** sections.media_url has no separate type column, so infer image vs video
 * from the file extension at render time. */
export function inferMediaKind(url: string | null | undefined): "image" | "video" {
  if (!url) return "image";
  const path = url.split("?")[0].toLowerCase();
  return VIDEO_EXTENSIONS.some((ext) => path.endsWith(ext)) ? "video" : "image";
}
