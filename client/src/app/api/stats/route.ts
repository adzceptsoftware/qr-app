import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Forward the viewer's timezone and range so day bucketing matches their calendar.
  const incoming = new URL(req.url).searchParams;
  const qs = new URLSearchParams();
  const tz = incoming.get("tz");
  const days = incoming.get("days");
  if (tz) qs.set("tz", tz);
  if (days) qs.set("days", days);

  const res = await fetch(`${BACKEND}/api/v1/stats/dashboard?${qs}`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    cache: "no-store",
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
