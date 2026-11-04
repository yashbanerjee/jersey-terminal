const WP_URL = process.env.WORDPRESS_URL?.replace(/\/$/, "");
const KEY = process.env.WOOCOMMERCE_CONSUMER_KEY;
const SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET;

export async function wooRest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  if (!WP_URL || !KEY || !SECRET) {
    throw new Error("WooCommerce REST credentials are not configured");
  }
  const url = new URL(`${WP_URL}/wp-json/wc/v3${path}`);
  url.searchParams.set("consumer_key", KEY);
  url.searchParams.set("consumer_secret", SECRET);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Woo REST ${res.status}: ${body}`);
  }
  return res.json() as Promise<T>;
}

export type WooOrder = {
  id: number;
  number: string;
  status: string;
  meta_data: Array<{ key: string; value: unknown }>;
};

export function getMeta(order: WooOrder, key: string): string | undefined {
  const hit = order.meta_data.find((m) => m.key === key);
  return hit?.value != null ? String(hit.value) : undefined;
}
