import { createHmac, timingSafeEqual } from "crypto";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";

export const dynamic = "force-dynamic";

const seen = new Map<string, number>();

function pruneSeen() {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  for (const [k, t] of seen) {
    if (t < cutoff) seen.delete(k);
  }
}

function verifySignature(raw: string, signature: string | null) {
  if (!env.wooWebhookSecret) return process.env.NODE_ENV !== "production";
  if (!signature) return false;
  const digest = createHmac("sha256", env.wooWebhookSecret)
    .update(raw, "utf8")
    .digest("base64");
  try {
    return timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-wc-webhook-signature");
  const deliveryId = req.headers.get("x-wc-webhook-delivery-id") ?? raw.slice(0, 64);

  if (!verifySignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  pruneSeen();
  if (seen.has(deliveryId)) {
    return NextResponse.json({ ok: true, duplicate: true });
  }
  seen.set(deliveryId, Date.now());

  const topic = req.headers.get("x-wc-webhook-topic") ?? "";
  if (topic.startsWith("product")) {
    revalidateTag("products", "max");
    revalidateTag("categories", "max");
  }

  return NextResponse.json({ ok: true });
}
