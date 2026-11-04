import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-revalidate-secret");
  if (!env.revalidateSecret || secret !== env.revalidateSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    tags?: string[];
    paths?: string[];
  };

  for (const tag of body.tags ?? []) {
    // Next.js 16 cacheLife profile
    revalidateTag(tag, "max");
  }
  for (const path of body.paths ?? []) {
    revalidatePath(path);
  }

  return NextResponse.json({ revalidated: true, tags: body.tags ?? [] });
}
