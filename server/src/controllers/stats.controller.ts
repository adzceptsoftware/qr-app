import type { Response } from "express";
import { Types, isValidObjectId } from "mongoose";
import type { AuthRequest, OrderStatus } from "../types";
import Order from "../models/order.model";

/** Cancelled tickets are excluded from every money figure. */
const EARNING = { $ne: "CANCELLED" as OrderStatus };

const ALL_STATUSES: OrderStatus[] = ["RECEIVED", "PREPARING", "READY", "SERVED", "CANCELLED"];

/**
 * Day bucketing runs in the viewer's timezone (sent by the browser) so "today"
 * on the dashboard matches the day the staff are actually working. Falls back
 * to UTC if the client sends nothing or sends something Mongo rejects.
 */
function resolveTimezone(raw: unknown): string {
  if (typeof raw !== "string" || !raw) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: raw });
    return raw;
  } catch {
    return "UTC";
  }
}

/** YYYY-MM-DD for `date` as seen in `tz`. */
function dayKey(date: Date, tz: string): string {
  // en-CA formats as YYYY-MM-DD, which is exactly what $dateToString produces.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export async function getDashboard(req: AuthRequest, res: Response) {
  // A SUPERADMIN has no restaurant scope; a fresh ObjectId matches no orders, so
  // they see an all-zero dashboard — mirroring how the other admin endpoints
  // return empty lists rather than erroring for that role.
  const rid = req.user!.restaurantId;
  const restaurantId = isValidObjectId(rid) ? new Types.ObjectId(rid) : new Types.ObjectId();
  const tz = resolveTimezone(req.query.tz);

  const days = req.query.days === "30" ? 30 : 7;
  const today = dayKey(new Date(), tz);

  // Window start: `days - 1` days back, so a 7-day range includes today.
  const windowStart = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
  // Widen by a day on each side — the exact cutoff is applied per-bucket below,
  // so a timezone offset can never clip the first or last day of the range.
  const fetchFrom = new Date(windowStart.getTime() - 24 * 60 * 60 * 1000);

  const [todayAgg, statusAgg, topItems, seriesAgg] = await Promise.all([
    // Today's revenue / order count / average ticket
    Order.aggregate<{ revenue: number; orders: number }>([
      { $match: { restaurantId, status: EARNING } },
      { $addFields: { day: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: tz } } } },
      { $match: { day: today } },
      { $group: { _id: null, revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),

    // Today's ticket count per status (cancelled included here — it's a count, not money)
    Order.aggregate<{ _id: OrderStatus; count: number }>([
      { $match: { restaurantId } },
      { $addFields: { day: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: tz } } } },
      { $match: { day: today } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),

    // Best sellers across the selected window
    Order.aggregate<{ _id: string; qty: number; revenue: number }>([
      { $match: { restaurantId, status: EARNING, createdAt: { $gte: fetchFrom } } },
      { $addFields: { day: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: tz } } } },
      { $match: { day: { $gte: dayKey(windowStart, tz) } } },
      { $unwind: "$items" },
      { $group: {
          _id: "$items.name",
          qty: { $sum: "$items.qty" },
          revenue: { $sum: { $multiply: ["$items.qty", "$items.price"] } },
      } },
      { $sort: { qty: -1 } },
      { $limit: 8 },
    ]),

    // Revenue / order count per day for the trend chart
    Order.aggregate<{ _id: string; revenue: number; orders: number }>([
      { $match: { restaurantId, status: EARNING, createdAt: { $gte: fetchFrom } } },
      { $addFields: { day: { $dateToString: { date: "$createdAt", format: "%Y-%m-%d", timezone: tz } } } },
      { $match: { day: { $gte: dayKey(windowStart, tz) } } },
      { $group: { _id: "$day", revenue: { $sum: "$total" }, orders: { $sum: 1 } } },
    ]),
  ]);

  const todayTotals = todayAgg[0] ?? { revenue: 0, orders: 0 };

  const byStatus = Object.fromEntries(ALL_STATUSES.map((s) => [s, 0])) as Record<OrderStatus, number>;
  for (const row of statusAgg) byStatus[row._id] = row.count;

  // Fill gaps so quiet days render as zero instead of collapsing the chart.
  const found = new Map(seriesAgg.map((r) => [r._id, r]));
  const series = Array.from({ length: days }, (_, i) => {
    const key = dayKey(new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000), tz);
    const row = found.get(key);
    return { date: key, revenue: row?.revenue ?? 0, orders: row?.orders ?? 0 };
  });

  res.json({
    today: {
      revenue: todayTotals.revenue,
      orders: todayTotals.orders,
      avgOrder: todayTotals.orders ? todayTotals.revenue / todayTotals.orders : 0,
      byStatus,
    },
    topItems: topItems.map((t) => ({ name: t._id, qty: t.qty, revenue: t.revenue })),
    series,
    days,
  });
}
