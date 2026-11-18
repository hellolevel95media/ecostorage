/**
 * First-touch campaign attribution (UTM tags).
 *
 * When a visitor lands with utm_* parameters, the first set is kept in
 * first-party localStorage for 30 days and sent with any enquiry, so an
 * enquiry can be credited to the social post that brought the visitor even
 * after they move to other pages. Stores only the tags, the landing path and
 * the referrer's hostname: no personal data, no full referrer URL.
 *
 * Treated as analytics: only stored when the visitor's consent level is
 * "accepted" (the default). Disclosed on /cookies.
 */

export const ATTRIBUTION_KEY = "ecostorage-attribution";
export const ATTRIBUTION_DAYS = 30;

export type Attribution = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  landing_path: string | null;
  referrer_host: string | null;
};

const FIELD_MAX = 120;
const FIELDS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "landing_path", "referrer_host"] as const;

function clean(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim().slice(0, FIELD_MAX);
  // Tags are short slugs; drop anything with control characters.
  return v && !/[\u0000-\u001f]/.test(v) ? v : null;
}

/** Allow-list and length-cap an untrusted attribution object. Null if it carries no UTM tag. */
export function sanitizeAttribution(input: unknown): Attribution | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  const out = {} as Attribution;
  for (const f of FIELDS) out[f] = clean(raw[f]);
  return out.utm_source || out.utm_medium || out.utm_campaign || out.utm_content ? out : null;
}

/** Reads the stored first touch; null if absent, expired or unreadable. */
export function readAttribution(): Attribution | null {
  try {
    const stored = JSON.parse(localStorage.getItem(ATTRIBUTION_KEY) ?? "null") as { at?: number; data?: unknown } | null;
    if (!stored || typeof stored.at !== "number") return null;
    if (Date.now() - stored.at > ATTRIBUTION_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(ATTRIBUTION_KEY);
      return null;
    }
    return sanitizeAttribution(stored.data);
  } catch {
    return null;
  }
}

/** Saves the first touch from the current URL. First touch wins: never overwrites a live record. */
export function captureAttribution(url: URL, referrer: string): void {
  try {
    if (readAttribution()) return;
    const p = url.searchParams;
    const data = sanitizeAttribution({
      utm_source: p.get("utm_source"),
      utm_medium: p.get("utm_medium"),
      utm_campaign: p.get("utm_campaign"),
      utm_content: p.get("utm_content"),
      landing_path: url.pathname,
      referrer_host: referrerHost(referrer, url.hostname),
    });
    if (data) localStorage.setItem(ATTRIBUTION_KEY, JSON.stringify({ at: Date.now(), data }));
  } catch {
    // Storage blocked: attribution is best-effort.
  }
}

function referrerHost(referrer: string, ownHost: string): string | null {
  try {
    const host = new URL(referrer).hostname;
    return host && host !== ownHost ? host : null;
  } catch {
    return null;
  }
}

/** UTM values only, as GA4 event parameters (omits empty ones). */
export function attributionParams(a: Attribution | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (a?.utm_source) out.utm_source = a.utm_source;
  if (a?.utm_medium) out.utm_medium = a.utm_medium;
  if (a?.utm_campaign) out.utm_campaign = a.utm_campaign;
  if (a?.utm_content) out.utm_content = a.utm_content;
  return out;
}
