import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export function turnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);
}

/**
 * Verifies a Cloudflare Turnstile token. If Turnstile isn't configured for
 * this environment (keys unset) the check is skipped so forms keep working;
 * the honeypot and rate limits still apply. Once configured it fails closed:
 * a missing token, network error or timeout counts as a failure.
 */
export async function verifyTurnstile(token: unknown, remoteIp?: string): Promise<boolean> {
  if (!turnstileEnabled()) return true;
  if (typeof token !== "string" || !token || token.length > 2048) return false;

  const body = new URLSearchParams({ secret: process.env.TURNSTILE_SECRET_KEY!, response: token });
  if (remoteIp && remoteIp !== "unknown") body.set("remoteip", remoteIp);

  try {
    const res = await fetch(VERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(5000) });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    return false;
  }
}
