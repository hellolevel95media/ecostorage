import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isoDaysAgo, dayKeysForLastNDays } from "@/lib/date-range";

export const dynamic = "force-dynamic";

const WINDOW_DAYS = 30;

export default async function AdminAnalyticsPage() {
  const supabase = await createServerSupabaseClient();
  const since = isoDaysAgo(WINDOW_DAYS);

  const { data: views } = await supabase
    .from("page_views")
    .select("path, referrer, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);

  const rows = views ?? [];
  const totalViews = rows.length;

  const byPath = new Map<string, number>();
  const byDay = new Map<string, number>();

  for (const row of rows) {
    byPath.set(row.path, (byPath.get(row.path) ?? 0) + 1);
    const day = row.created_at.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }

  const topPaths = [...byPath.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
  const last14Days = dayKeysForLastNDays(14).map((day) => ({ day, count: byDay.get(day) ?? 0 }));
  const maxDayCount = Math.max(1, ...last14Days.map((d) => d.count));

  return (
    <div>
      <h2 className="text-xl font-semibold">Web traffic</h2>
      <p className="mt-1 text-sm text-foreground/60">
        Anonymous page views over the last {WINDOW_DAYS} days, recorded only from visitors who
        accept the cookie consent banner.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">Total views</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-semibold tracking-wide text-foreground/40 uppercase">Pages visited</p>
          <p className="mt-1 text-3xl font-bold tabular-nums">{byPath.size.toLocaleString()}</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <p className="text-sm font-semibold">Views per day (last 14 days)</p>
        <div className="mt-4 flex items-end gap-1.5" style={{ height: 120 }}>
          {last14Days.map(({ day, count }) => (
            <div key={day} className="flex flex-1 flex-col items-center justify-end gap-1" title={`${day}: ${count}`}>
              <div
                className="w-full rounded-t bg-brand/70"
                style={{ height: `${Math.max(4, (count / maxDayCount) * 100)}px` }}
              />
              <span className="text-[10px] text-foreground/40">{day.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="bg-card text-xs text-foreground/50 uppercase">
            <tr>
              <th className="px-4 py-3">Page</th>
              <th className="px-4 py-3">Views</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {topPaths.map(([path, count]) => (
              <tr key={path}>
                <td className="px-4 py-3 font-mono text-xs">{path}</td>
                <td className="px-4 py-3 tabular-nums">{count}</td>
              </tr>
            ))}
            {topPaths.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-center text-foreground/50">
                  No traffic recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
