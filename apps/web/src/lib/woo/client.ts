import "server-only";
import { env } from "@/lib/env";

/**
 * Server-only WooCommerce clients.
 * Consumer secrets never ship to the browser.
 */

function restAuthQuery(url: URL) {
  if (!env.wooKey || !env.wooSecret) {
    throw new Error("WooCommerce REST credentials are not configured");
  }
  url.searchParams.set("consumer_key", env.wooKey);
  url.searchParams.set("consumer_secret", env.wooSecret);
}

export async function wooRest<T>(
  path: string,
  init?: RequestInit & { next?: NextFetchRequestConfig },
): Promise<T> {
  const base = env.wordpressUrl.replace(/\/$/, "");
  const url = new URL(`${base}/wp-json/wc/v3${path.startsWith("/") ? path : `/${path}`}`);
  restAuthQuery(url);

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!res.ok) {
    throw new Error(`Woo REST ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}

export type StoreSession = {
  cartToken?: string;
  nonce?: string;
};

export async function wooStore<T>(
  path: string,
  init: RequestInit & {
    session?: StoreSession;
    next?: NextFetchRequestConfig;
  } = {},
): Promise<{ data: T; cartToken?: string; nonce?: string }> {
  const base = env.wordpressUrl.replace(/\/$/, "");
  const url = `${base}/wp-json/wc/store/v1${path.startsWith("/") ? path : `/${path}`}`;
  const { session, next, ...rest } = init;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers ?? {}),
  };

  if (session?.cartToken) {
    (headers as Record<string, string>)["Cart-Token"] = session.cartToken;
  }
  if (session?.nonce) {
    (headers as Record<string, string>)["Nonce"] = session.nonce;
  }

  const res = await fetch(url, {
    ...rest,
    headers,
    cache: next ? undefined : "no-store",
    next,
  });
  const cartToken = res.headers.get("Cart-Token") ?? session?.cartToken;
  const nonce = res.headers.get("Nonce") ?? session?.nonce;

  if (!res.ok) {
    const text = await res.text();
    // Surface WooCommerce's human-readable message when present (e.g. validation errors)
    let message = `Woo Store API ${res.status}: ${text}`;
    try {
      const parsed = JSON.parse(text) as { message?: string };
      if (parsed.message) message = parsed.message.replace(/<[^>]+>/g, "");
    } catch {
      // not JSON
    }
    throw new Error(message);
  }

  return {
    data: (await res.json()) as T,
    cartToken: cartToken ?? undefined,
    nonce: nonce ?? undefined,
  };
}

export async function jtSports<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const base = env.wordpressApiUrl.replace(/\/$/, "");
  const url = `${base}/jt-sports/v1${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`JT Sports API ${res.status}: ${await res.text()}`);
  }
  return res.json() as Promise<T>;
}
