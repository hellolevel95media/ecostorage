import Link from "next/link";
import type { ReactNode } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isoDaysAgo } from "@/lib/date-range";
import { ga4Configured, runReport } from "@/lib/ga4";

export const dynamic = "force-dynamic";

const RANGES = [7, 28, 90] as const;
type Range = (typeof RANGES)[number];

const SEARCH_ENGINE_NAMES: Record<string, string> = {
  google: "Google",
  bing: "Bing",
  yahoo: "Yahoo",
  duckduckgo: "DuckDuckGo",
  baidu: "Baidu",
  yandex: "Yandex",
  ecosia: "Ecosia",
  naver: "Naver",
  brave: "Brave Search",
  "search.brave.com": "Brave Search",
};

function fmtDuration(seconds: number) {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0s";
  const s = Math.round(seconds);
  const m = Math.floor(s / 60);
  return m ? `${m}m ${String(s % 60).padStart(2, "0")}s` : `${s}s`;
}

function fmtInt(n: number) {
  return Math.round(n).toLocaleString("en-SG");
}

function pct(part: number, whole: number) {
  return whole ? `${Math.round((part / whole) * 100)}%` : "0%";
}

function perVisit(total: number, count: number) {
  return fmtDuration(count ? total / count : 0);
}

/** Last n calendar days in Singapore time (GA4 reports in the property's time zone, set to Singapore). */
function sgDayKeys(n: number) {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Singapore" });
  return Array.from({ length: n }, (_, i) => fmt.format(new Date(Date.now() - (n - 1 - i) * 86_400_000)));
}

const mediumFilter = (value: string) => ({ filter: { fieldName: "sessionMedium", stringFilter: { value } } });

async function loadGa4(days: Range) {
  const startDate = `${days - 1}daysAgo`;
  const [summary, daily, engines, channels, referrers, pages, devices, countries] = await Promise.all([
    runReport({
      startDate,
      metrics: ["activeUsers", "newUsers", "sessions", "screenPageViews", "userEngagementDuration", "engagementRate"],
      limit: 1,
    }),
    runReport({ startDate, dimensions: ["date"], metrics: ["activeUsers", "sessions"], orderByDimension: "date", limit: 100 }),
    runReport({
      startDate,
      dimensions: ["sessionSource"],
      metrics: ["sessions", "userEngagementDuration"],
      dimensionFilter: mediumFilter("organic"),
      orderByMetric: "sessions",
      limit: 10,
    }),
    runReport({
      startDate,
      dimensions: ["sessionDefaultChannelGroup"],
      metrics: ["sessions", "userEngagementDuration"],
      orderByMetric: "sessions",
      limit: 12,
    }),
    runReport({
      startDate,
      dimensions: ["sessionSource"],
      metrics: ["sessions"],
      dimensionFilter: mediumFilter("referral"),
      orderByMetric: "sessions",
      limit: 10,
    }),
    runReport({
      startDate,
      dimensions: ["pagePath"],
      metrics: ["screenPageViews", "userEngagementDuration", "activeUsers"],
      orderByMetric: "screenPageViews",
      limit: 15,
    }),
    runReport({ startDate, dimensions: ["deviceCategory"], metrics: ["activeUsers"], orderByMetric: "activeUsers", limit: 5 }),
    runReport({ startDate, dimensions: ["country"], metrics: ["activeUsers"], orderByMetric: "activeUsers", limit: 8 }),
  ]);
  return { summary, daily, engines, channels, referrers, pages, devices, countries };
}

export default async function AdminAnalyticsPage(props: PageProps<"/admin/analytics">) {
  const query = await props.searchParams;
  const requested = Number(Array.isArray(query.days) ? query.days[0] : query.days);
  const days: Range = (RANGES as readonly number[]).includes(requested) ? (requested as Range) : 28;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Website traffic</h2>
          <p className="mt-1 text-sm text-foreground/60">
            From Google Analytics. Only visitors who accept cookies are counted, so real numbers are higher.
          </p>
        </div>
        <nav className="flex gap-1 rounded-lg border border-border bg-card p-1 text-sm" aria-label="Date range">
          {RANGES.map((r) => (
            <Link
              key={r}
              href={`/admin/analytics?days=${r}`}
              aria-current={r === days ? "page" : undefined}
              className={`rounded-md px-3 py-1.5 font-medium ${
                r === days ? "bg-brand text-brand-foreground" : "text-foreground/60 hover:text-brand-ink"
              }`}
            >
              {r} days
            </Link>
          ))}
        </nav>
      </div>

      {ga4Configured() ? <Ga4Dashboard days={days} /> : <SetupNotice />}

      <BuiltInCounter />
    </div>
  );
}

async function Ga4Dashboard({ days }: { days: Range }) {
  let data: Awaited<ReturnType<typeof loadGa4>>;
  try {
    data = await loadGa4(days);
  } catch (error) {
    return (
      <div className="mt-6 rounded-xl border border-red-300 bg-red-50 p-5 text-sm text-red-900">
        <p className="font-semibold">Couldn&apos;t load Google Analytics.</p>
        <p className="mt-1">{error instanceof Error ? error.message : "Unknown error."}</p>
      </div>
    );
  }

  const t = data.summary.totals.length ? data.summary.totals : (data.summary.rows[0]?.mets ?? []);
  const [users = 0, newUsers = 0, sessions = 0, views = 0, engagement = 0, engagementRate = 0] = t;

  const dailyMap = new Map(data.daily.rows.map((r) => [r.dims[0], r.mets]));
  const dailyRows = sgDayKeys(days).map((iso) => {
    const m = dailyMap.get(iso.replaceAll("-", "")) ?? [0, 0];
    return { iso, users: m[0], sessions: m[1] };
  });
  const maxDaily = Math.max(1, ...dailyRows.map((d) => d.users));
  const labelEvery = Math.ceil(days / 7);
  const organic = data.engines.totals[0] ?? data.engines.rows.reduce((sum, r) => sum + r.mets[0], 0);

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Visitors" value={fmtInt(users)} note={`${fmtInt(newUsers)} first-time`} />
        <Stat label="Visits" value={fmtInt(sessions)} note={`${fmtInt(views)} pages viewed`} />
        <Stat label="Avg time per visit" value={perVisit(engagement, sessions)} note="Time actively on the site" />
        <Stat label="Engaged visits" value={pct(engagementRate, 1)} note="Stayed 10s+ or saw 2+ pages" />
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Visitors per day</p>
        <div className="mt-4 flex items-end gap-px sm:gap-1" style={{ height: 140 }}>
          {dailyRows.map((d, i) => (
            <div
              key={d.iso}
              className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1"
              title={`${d.iso.slice(8)}/${d.iso.slice(5, 7)}: ${d.users} visitors, ${d.sessions} visits`}
            >
              <div
                className="w-full rounded-t bg-brand/70"
                style={{ height: `${d.users ? Math.max(3, (d.users / maxDaily) * 112) : 1}px` }}
              />
              <span className="h-3 text-[10px] leading-3 whitespace-nowrap text-foreground/40">
                {i % labelEvery === 0 ? `${d.iso.slice(8)}/${d.iso.slice(5, 7)}` : ""}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Table
          title="Search engines"
          subtitle={`${fmtInt(organic)} visits from unpaid search results (${pct(organic, sessions)} of all visits)`}
          head={["Search engine", "Visits", "Share", "Avg time"]}
          rows={data.engines.rows.map((r) => [
            SEARCH_ENGINE_NAMES[r.dims[0].toLowerCase()] ?? r.dims[0],
            fmtInt(r.mets[0]),
            pct(r.mets[0], organic),
            perVisit(r.mets[1], r.mets[0]),
          ])}
          empty="No search engine visits yet."
        />
        <Table
          title="How visitors found the site"
          subtitle="Every visit, grouped by where it came from"
          head={["Source", "Visits", "Share", "Avg time"]}
          rows={data.channels.rows.map((r) => [
            r.dims[0] === "Unassigned" ? "Unknown" : r.dims[0],
            fmtInt(r.mets[0]),
            pct(r.mets[0], sessions),
            perVisit(r.mets[1], r.mets[0]),
          ])}
          empty="No visits yet."
        />
      </div>

      <div className="mt-6">
        <Table
          title="Most viewed pages"
          head={["Page", "Views", "Visitors", "Avg time on page"]}
          rows={data.pages.rows.map((r) => [
            <span key="p" className="font-mono text-xs break-all">
              {r.dims[0]}
            </span>,
            fmtInt(r.mets[0]),
            fmtInt(r.mets[2]),
            perVisit(r.mets[1], r.mets[0]),
          ])}
          empty="No page views yet."
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Table
          title="Other websites linking here"
          head={["Website", "Visits"]}
          rows={data.referrers.rows.map((r) => [r.dims[0], fmtInt(r.mets[0])])}
          empty="None yet."
        />
        <Table
          title="Devices"
          head={["Device", "Share"]}
          rows={data.devices.rows.map((r) => [r.dims[0].replace(/^./, (c) => c.toUpperCase()), pct(r.mets[0], users)])}
          empty="None yet."
        />
        <Table
          title="Countries"
          head={["Country", "Visitors"]}
          rows={data.countries.rows.map((r) => [r.dims[0], fmtInt(r.mets[0])])}
          empty="None yet."
        />
      </div>
    </>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="text-xs font-semibold tracking-wide text-foreground/50 uppercase">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs text-foreground/50">{note}</p>
    </div>
  );
}

function Table({
  title,
  subtitle,
  head,
  rows,
  empty,
}: {
  title: string;
  subtitle?: string;
  head: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="px-4 pt-4 pb-2">
        <p className="text-sm font-semibold">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-foreground/50">{subtitle}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-xs text-foreground/50 uppercase">
            <tr>
              {head.map((h, i) => (
                <th key={h} className={`px-4 py-2 font-medium ${i ? "text-right" : ""}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((cells, ri) => (
              <tr key={ri}>
                {cells.map((c, ci) => (
                  <td key={ci} className={`px-4 py-2.5 ${ci ? "text-right tabular-nums" : ""}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={head.length} className="px-4 py-6 text-center text-foreground/50">
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SetupNotice() {
  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-5 text-sm">
      <p className="font-semibold">Google Analytics isn&apos;t connected yet</p>
      <p className="mt-1 text-foreground/70">
        Once the Google Analytics settings are added in Vercel (steps in{" "}
        <code>docs/google-analytics-setup.md</code>), this page shows visitors, time on site, search engines
        and top pages.
      </p>
    </div>
  );
}

/** The site's own anonymous page counter (page_views table), kept as a cross-check. */
async function BuiltInCounter() {
  const supabase = await createServerSupabaseClient();
  const { data: views } = await supabase
    .from("page_views")
    .select("path, created_at")
    .gte("created_at", isoDaysAgo(30))
    .limit(5000);
  const rows = views ?? [];
  const byPath = new Map<string, number>();
  for (const row of rows) byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
  const top = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <details className="mt-8 rounded-xl border border-border bg-card p-5 text-sm">
      <summary className="cursor-pointer font-semibold">
        Built-in page counter: {rows.length.toLocaleString("en-SG")} views in the last 30 days
      </summary>
      <p className="mt-2 text-foreground/60">The site&apos;s own simple counter, separate from Google. Useful as a cross-check.</p>
      <ul className="mt-3 space-y-1">
        {top.map(([path, count]) => (
          <li key={path} className="flex justify-between gap-4">
            <span className="font-mono text-xs break-all">{path}</span>
            <span className="tabular-nums">{count}</span>
          </li>
        ))}
        {top.length === 0 && <li className="text-foreground/50">No views recorded yet.</li>}
      </ul>
    </details>
  );
}
