/**
 * First-party referral cookie set when someone arrives via an affiliate link
 * (?ref=CODE). Holds only the code and the click time — no personal data —
 * and is read server-side when an enquiry is submitted (httpOnly).
 * Disclosed on /cookies. Last click wins.
 */

export const REFERRAL_COOKIE = "eco_ref";

const CODE = /^[A-HJ-NP-Z2-9]{8}$/;

export function referralCookieMaxAge() {
  const days = Number(process.env.REFERRAL_COOKIE_DAYS ?? 14);
  return (Number.isFinite(days) && days > 0 ? Math.min(days, 90) : 14) * 24 * 60 * 60;
}

export function serializeReferral(code: string, clickedAt = Date.now()) {
  return `${code}.${Math.floor(clickedAt / 1000)}`;
}

export function parseReferral(value: string | undefined): { code: string; clickedAt: Date } | null {
  const match = /^([A-HJ-NP-Z2-9]{8})\.(\d{9,11})$/.exec(value ?? "");
  if (!match) return null;
  return { code: match[1], clickedAt: new Date(Number(match[2]) * 1000) };
}

/** Normalises a ?ref= value; null if it isn't a well-formed code. */
export function refParamCode(value: string | null): string | null {
  const code = (value ?? "").replace(/\s/g, "").toUpperCase();
  return CODE.test(code) ? code : null;
}
