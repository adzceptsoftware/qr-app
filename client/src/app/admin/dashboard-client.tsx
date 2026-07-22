"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader, Card } from "@/components/dashboard/ui";
import { RevenueChart, CHART_MARK, type SeriesPoint } from "./revenue-chart";
import type { OrderStatus } from "@/lib/order-types";

type Dashboard = {
  today: {
    revenue: number;
    orders: number;
    avgOrder: number;
    byStatus: Record<OrderStatus, number>;
  };
  topItems: { name: string; qty: number; revenue: number }[];
  series: SeriesPoint[];
  days: number;
};

const money = (n: number) => `Rs ${n.toFixed(2)}`;

const STATUS_LABELS: { status: OrderStatus; label: string; tone: string }[] = [
  { status: "RECEIVED", label: "Received", tone: "text-foreground" },
  { status: "PREPARING", label: "Preparing", tone: "text-amber-600" },
  { status: "READY", label: "Ready", tone: "text-emerald-600" },
  { status: "SERVED", label: "Served", tone: "text-muted" },
  { status: "CANCELLED", label: "Cancelled", tone: "text-danger" },
];

export function DashboardClient() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  // Derived, not stored: the payload reports the range it covers, so a mismatch
  // with the selected range means a refetch is in flight. Dimming the stale data
  // avoids a skeleton flash and a layout jump when the range changes.
  const refetching = data !== null && data.days !== days;

  // A pure fetcher — every state update happens in the effect's callbacks below,
  // so nothing is set synchronously during render.
  const load = useCallback(async (range: number): Promise<Dashboard> => {
    // The server buckets days in this timezone so "today" matches the staff's day.
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const res = await fetch(`/api/stats?days=${range}&tz=${encodeURIComponent(tz)}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Could not load dashboard");
    return (await res.json()) as Dashboard;
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = () =>
      load(days)
        .then((next) => {
          if (cancelled) return;
          setData(next);
          setError(null);
        })
        .catch((e: unknown) => {
          if (cancelled) return;
          setError(e instanceof Error ? e.message : "Could not load dashboard");
        });

    void run();
    // Keep today's figures fresh while the dashboard sits open on a back-office screen.
    const poll = setInterval(run, 30000);
    return () => { cancelled = true; clearInterval(poll); };
  }, [days, load]);

  if (error && !data) {
    return (
      <div>
        <PageHeader title="Dashboard" />
        <Card className="p-6">
          <p className="text-sm text-danger">{error}</p>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <PageHeader title="Dashboard" description="Today at a glance." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-border" />
              <div className="mt-3 h-8 w-20 animate-pulse rounded bg-border" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { today, topItems, series } = data;
  const topQty = Math.max(...topItems.map((t) => t.qty), 1);
  const rangeTotal = series.reduce((s, p) => s + p.revenue, 0);

  const tiles = [
    { label: "Today's Revenue", value: money(today.revenue), accent: "text-foreground" },
    { label: "Today's Orders", value: String(today.orders), accent: "text-indigo-600" },
    { label: "Average Order", value: money(today.avgOrder), accent: "text-emerald-600" },
    { label: `Last ${data.days} Days`, value: money(rangeTotal), accent: "text-amber-600" },
  ];

  return (
    <div className={refetching ? "opacity-60 transition-opacity" : "transition-opacity"}>
      <PageHeader
        title="Dashboard"
        description="Today at a glance, plus how the last few days have gone."
        actions={
          /* One range control, scoping every chart below it. */
          <div className="flex items-center gap-1 rounded-xl border border-border bg-surface p-1">
            {[7, 30].map((r) => (
              <button
                key={r}
                onClick={() => setDays(r)}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                  days === r ? "bg-accent text-accent-foreground" : "text-muted hover:text-foreground"
                }`}
              >
                {r} days
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tiles.map((t) => (
          <Card key={t.label} className="p-5">
            <p className="text-sm font-medium text-muted">{t.label}</p>
            <p className={`mt-2 text-3xl font-bold tracking-tight ${t.accent}`}>{t.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-6 p-5">
        <RevenueChart series={series} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="font-bold text-foreground">Top Sellers</h2>
          <p className="mb-4 text-sm text-muted">Best-selling items over the last {data.days} days</p>

          {topItems.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">No sales in this period yet.</p>
          ) : (
            <ul className="space-y-3">
              {topItems.map((item) => (
                <li key={item.name}>
                  <div className="mb-1 flex items-baseline justify-between gap-3">
                    <span className="truncate text-sm font-medium text-foreground">{item.name}</span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">
                      {item.qty}
                      <span className="ml-1 font-normal text-muted">sold</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-background">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(item.qty / topQty) * 100}%`, backgroundColor: CHART_MARK }}
                      />
                    </div>
                    <span className="w-24 shrink-0 text-right text-xs tabular-nums text-muted">
                      {money(item.revenue)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="font-bold text-foreground">Today&rsquo;s Orders</h2>
          <p className="mb-4 text-sm text-muted">Where today&rsquo;s tickets currently stand</p>
          <ul className="divide-y divide-border">
            {STATUS_LABELS.map((s) => (
              <li key={s.status} className="flex items-center justify-between py-3">
                <span className="text-sm font-medium text-foreground">{s.label}</span>
                <span className={`text-lg font-bold tabular-nums ${s.tone}`}>{today.byStatus[s.status] ?? 0}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
