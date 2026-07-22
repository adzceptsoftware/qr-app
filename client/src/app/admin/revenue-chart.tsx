"use client";

import { useState } from "react";

export type SeriesPoint = { date: string; revenue: number; orders: number };

/**
 * A deeper step of the app's amber accent (#f5b301). The accent itself sits at
 * 1.8:1 against white — too faint for a chart mark — so marks use this step,
 * which clears 3:1 while staying on-brand.
 */
const MARK = "#b87d00";

const money = (n: number) => `Rs ${n.toFixed(2)}`;

/** "2026-07-21" → "21 Jul". Parsed manually so it isn't shifted by the local timezone. */
function shortDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/** Rounds the axis top up to a friendly number so gridlines land on readable values. */
function niceMax(value: number) {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function RevenueChart({ series }: { series: SeriesPoint[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [showTable, setShowTable] = useState(false);

  const max = niceMax(Math.max(...series.map((p) => p.revenue), 0));
  const peakIndex = series.reduce((best, p, i) => (p.revenue > series[best].revenue ? i : best), 0);
  const hasRevenue = series.some((p) => p.revenue > 0);

  // With 30 days there isn't room for every date, so label roughly every 5th.
  const labelEvery = series.length > 14 ? 5 : 1;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-foreground">Revenue</h2>
          <p className="text-sm text-muted">Daily takings, cancelled orders excluded</p>
        </div>
        <button
          onClick={() => setShowTable((v) => !v)}
          className="rounded-lg px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:bg-background hover:text-foreground"
        >
          {showTable ? "Show chart" : "Show table"}
        </button>
      </div>

      {showTable ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 text-right font-medium">Orders</th>
                <th className="py-2 text-right font-medium">Revenue</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {series.map((p) => (
                <tr key={p.date} className="border-b border-border last:border-0">
                  <td className="py-2 text-foreground">{shortDate(p.date)}</td>
                  <td className="py-2 text-right text-muted">{p.orders}</td>
                  <td className="py-2 text-right font-semibold text-foreground">{money(p.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex gap-3">
          {/* y-axis ticks */}
          <div className="flex w-14 shrink-0 flex-col justify-between pb-6 text-right text-[11px] tabular-nums text-muted">
            {[1, 0.75, 0.5, 0.25, 0].map((f) => (
              <span key={f}>{Math.round(max * f)}</span>
            ))}
          </div>

          <div className="relative min-w-0 flex-1">
            {/* recessive solid hairline grid */}
            <div className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-between">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="h-px w-full bg-border" />
              ))}
            </div>

            <div className="relative flex h-[200px] items-end gap-[2px]">
              {series.map((p, i) => {
                const pct = max ? (p.revenue / max) * 100 : 0;
                const isPeak = hasRevenue && i === peakIndex;
                const active = hovered === i;
                return (
                  <div
                    key={p.date}
                    className="group relative flex h-full flex-1 cursor-default items-end"
                    onMouseEnter={() => setHovered(i)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(i)}
                    onBlur={() => setHovered(null)}
                    tabIndex={0}
                    aria-label={`${shortDate(p.date)}: ${money(p.revenue)}, ${p.orders} orders`}
                  >
                    {/* Peak gets a direct label; everything else lives in the tooltip and table. */}
                    {isPeak && !active && (
                      <span
                        className="pointer-events-none absolute inset-x-0 bottom-0 text-center text-[10px] font-semibold tabular-nums text-foreground"
                        style={{ bottom: `calc(${pct}% + 4px)` }}
                      >
                        {Math.round(p.revenue)}
                      </span>
                    )}

                    <div
                      className="w-full rounded-t-[4px] transition-opacity"
                      style={{
                        height: `${pct}%`,
                        minHeight: p.revenue > 0 ? 2 : 0,
                        backgroundColor: MARK,
                        opacity: hovered === null || active ? 1 : 0.55,
                      }}
                    />

                    {active && (
                      <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg border border-border bg-surface px-3 py-2 text-left shadow-lg">
                        <p className="text-[11px] font-medium text-muted">{shortDate(p.date)}</p>
                        <p className="text-sm font-bold tabular-nums text-foreground">{money(p.revenue)}</p>
                        <p className="text-[11px] tabular-nums text-muted">{p.orders} orders</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* x-axis */}
            <div className="mt-1 flex gap-[2px]">
              {series.map((p, i) => (
                <span
                  key={p.date}
                  className="flex-1 overflow-hidden text-center text-[10px] text-muted"
                >
                  {i % labelEvery === 0 || i === series.length - 1 ? shortDate(p.date) : ""}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const CHART_MARK = MARK;
