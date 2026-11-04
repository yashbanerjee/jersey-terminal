import { NextRequest, NextResponse } from "next/server";
import { jtSports } from "@/lib/woo/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const order = req.nextUrl.searchParams.get("order");
  const email = req.nextUrl.searchParams.get("email") ?? undefined;
  if (!order) {
    return NextResponse.json({ error: "order is required" }, { status: 400 });
  }

  try {
    const q = new URLSearchParams({ order });
    if (email) q.set("email", email);
    const data = await jtSports<Record<string, unknown>>(`/tracking?${q}`);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Tracking unavailable" },
      { status: 404 },
    );
  }
}
