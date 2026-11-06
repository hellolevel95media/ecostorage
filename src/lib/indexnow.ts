import { SITE_URL } from "@/lib/site";

// Public by design: IndexNow proves ownership by serving this key at /<key>.txt.
export const INDEXNOW_KEY = "50dd87de68f43f546fca12543e76daeb";

/** Tell Bing (and other IndexNow engines) these URLs changed. Never throws. */
export async function pingIndexNow(paths: string[]): Promise<void> {
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
        urlList: paths.map((p) => `${SITE_URL}${p}`),
      }),
    });
  } catch {
    // Best-effort: publishing must not fail because a search ping did.
  }
}
