import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:5000";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const res = await fetch(`${BACKEND}/api/v1/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    body: formData,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
