import type { Job } from "bullmq";
import { getMeta, wooRest, type WooOrder } from "../lib/woo.js";

/**
 * Pull open shipments from Woo and refresh tracking from courier APIs
 * via the WordPress plugin endpoint (single source of courier credentials).
 */
export async function syncTrackingJob(_job: Job) {
  const orders = await wooRest<WooOrder[]>(
    "/orders?status=processing,completed&per_page=50&meta_key=_jt_awb",
  );

  const wp = process.env.WORDPRESS_URL?.replace(/\/$/, "");
  const secret = process.env.JT_INTERNAL_API_SECRET;
  if (!wp || !secret) {
    console.warn("[tracking] missing WORDPRESS_URL or JT_INTERNAL_API_SECRET");
    return { synced: 0 };
  }

  let synced = 0;
  for (const order of orders) {
    const awb = getMeta(order, "_jt_awb");
    const courier = getMeta(order, "_jt_courier");
    if (!awb || !courier) continue;

    const res = await fetch(`${wp}/wp-json/jt-sports/v1/tracking/sync`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-JT-Internal-Secret": secret,
      },
      body: JSON.stringify({ order_id: order.id, awb, courier }),
    });

    if (!res.ok) {
      console.error(`[tracking] sync failed order=${order.id}`, await res.text());
      continue;
    }
    synced += 1;
  }

  return { synced };
}
