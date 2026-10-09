export function formatDate(iso: string, locale: "en" | "zh" = "en"): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-SG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Singapore",
  }).format(new Date(iso));
}
