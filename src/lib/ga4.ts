import "server-only";
import { createSign } from "node:crypto";

/**
 * Minimal Google Analytics 4 Data API client (no SDK). Authenticates as a
 * Google Cloud service account that has "Viewer" access on the GA4 property.
 *
 * Env (server only):
 *   GA4_PROPERTY_ID   numeric property ID, e.g. 412345678 (not the G- ID)
 *   GA4_CLIENT_EMAIL  service account email
 *   GA4_PRIVATE_KEY   service account private key (PEM; literal \n allowed)
 */

export type Ga4Row = { dims: string[]; mets: number[] };
export type Ga4Report = { rows: Ga4Row[]; totals: number[] };

type ReportRequest = {
  dimensions?: string[];
  metrics: string[];
  startDate: string;
  endDate?: string;
  limit?: number;
  orderByMetric?: string;
  orderByDimension?: string;
  dimensionFilter?: unknown;
};

export function ga4Configured() {
  return Boolean(process.env.GA4_PROPERTY_ID && process.env.GA4_CLIENT_EMAIL && process.env.GA4_PRIVATE_KEY);
}

let cachedToken: { token: string; expires: number } | null = null;

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

async function accessToken(): Promise<string> {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.token;
  const email = process.env.GA4_CLIENT_EMAIL!;
  const key = process.env.GA4_PRIVATE_KEY!.replace(/\\n/g, "\n");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = b64url(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  );
  const signer = createSign("RSA-SHA256");
  signer.update(`${header}.${claims}`);
  const jwt = `${header}.${claims}.${b64url(signer.sign(key))}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Google sign-in failed (${res.status}). Check GA4_CLIENT_EMAIL and GA4_PRIVATE_KEY.`);
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { token: json.access_token, expires: Date.now() + json.expires_in * 1000 };
  return json.access_token;
}

export async function runReport(req: ReportRequest): Promise<Ga4Report> {
  const token = await accessToken();
  const body: Record<string, unknown> = {
    dateRanges: [{ startDate: req.startDate, endDate: req.endDate ?? "today" }],
    dimensions: (req.dimensions ?? []).map((name) => ({ name })),
    metrics: req.metrics.map((name) => ({ name })),
    limit: req.limit ?? 10,
    metricAggregations: ["TOTAL"],
  };
  if (req.orderByMetric) body.orderBys = [{ metric: { metricName: req.orderByMetric }, desc: true }];
  if (req.orderByDimension) body.orderBys = [{ dimension: { dimensionName: req.orderByDimension } }];
  if (req.dimensionFilter) body.dimensionFilter = req.dimensionFilter;

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${process.env.GA4_PROPERTY_ID}:runReport`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  if (!res.ok) {
    const detail = ((await res.json().catch(() => null)) as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(`Google Analytics report failed (${res.status})${detail ? `: ${detail}` : ""}`);
  }
  type Raw = {
    rows?: { dimensionValues?: { value: string }[]; metricValues?: { value: string }[] }[];
    totals?: { metricValues?: { value: string }[] }[];
  };
  const json = (await res.json()) as Raw;
  return {
    rows: (json.rows ?? []).map((r) => ({
      dims: (r.dimensionValues ?? []).map((d) => d.value),
      mets: (r.metricValues ?? []).map((m) => Number(m.value)),
    })),
    totals: (json.totals?.[0]?.metricValues ?? []).map((m) => Number(m.value)),
  };
}
