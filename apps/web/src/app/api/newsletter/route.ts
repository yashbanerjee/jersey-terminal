import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";

export const runtime = "nodejs";

const schema = z.object({
  email: z.string().trim().email().max(160),
});

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json());
    const key = `jt:newsletter:${body.email.toLowerCase()}`;

    if (env.redisUrl) {
      try {
        const Redis = (await import("ioredis")).default;
        const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
        await redis.connect();
        await redis.set(key, JSON.stringify({ email: body.email, at: new Date().toISOString() }), "EX", 60 * 60 * 24 * 365);
        await redis.sadd("jt:newsletter:emails", body.email.toLowerCase());
        await redis.quit();
      } catch {
        // fall through — still accept signup
      }
    } else {
      const g = globalThis as typeof globalThis & { __jtNewsletter?: Set<string> };
      if (!g.__jtNewsletter) g.__jtNewsletter = new Set();
      g.__jtNewsletter.add(body.email.toLowerCase());
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid email";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}
