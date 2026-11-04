import type { Job } from "bullmq";

/**
 * Ask WordPress plugin to flush failed webhook deliveries / dead-letter queue.
 */
export async function retryWebhooksJob(_job: Job) {
  const wp = process.env.WORDPRESS_URL?.replace(/\/$/, "");
  const secret = process.env.JT_INTERNAL_API_SECRET;
  if (!wp || !secret) {
    console.warn("[webhooks] missing config");
    return { retried: 0 };
  }

  const res = await fetch(`${wp}/wp-json/jt-sports/v1/webhooks/retry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-JT-Internal-Secret": secret,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`webhook retry failed: ${await res.text()}`);
  }

  return (await res.json()) as { retried: number };
}
