import "server-only";
import { env } from "@/lib/env";

export type StoredCustomBrief = {
  orderRef: string;
  tier: string;
  zone: string;
  quantity: number;
  contactName: string;
  email: string;
  phone: string;
  teamName: string;
  primaryColor?: string;
  secondaryColor?: string;
  notes?: string;
  logoDataUrl?: string;
  players: Array<{ name: string; number: string; size: string }>;
  sponsors: Array<{ name: string; placement: string; notes?: string }>;
  createdAt: string;
};

function memory() {
  const g = globalThis as typeof globalThis & {
    __jtCustomOrders?: Map<string, StoredCustomBrief>;
  };
  if (!g.__jtCustomOrders) g.__jtCustomOrders = new Map();
  return g.__jtCustomOrders;
}

export async function saveCustomBrief(brief: StoredCustomBrief) {
  memory().set(brief.orderRef, brief);
  if (!env.redisUrl) return;
  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
    await redis.connect();
    await redis.set(`jt:custom-order:${brief.orderRef}`, JSON.stringify(brief), "EX", 60 * 60 * 24 * 30);
    await redis.quit();
  } catch {
    // Memory fallback is enough for checkout continuity on this instance.
  }
}

export async function loadCustomBrief(orderRef: string) {
  const local = memory().get(orderRef);
  if (local) return local;
  if (!env.redisUrl) return null;
  try {
    const Redis = (await import("ioredis")).default;
    const redis = new Redis(env.redisUrl, { maxRetriesPerRequest: 1, lazyConnect: true });
    await redis.connect();
    const raw = await redis.get(`jt:custom-order:${orderRef}`);
    await redis.quit();
    if (!raw) return null;
    return JSON.parse(raw) as StoredCustomBrief;
  } catch {
    return null;
  }
}
