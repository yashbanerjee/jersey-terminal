import type { Job } from "bullmq";
import { getMeta, wooRest, type WooOrder } from "../lib/woo.js";

/**
 * Create shipments for paid, eligible orders that lack an AWB.
 * Fulfilment ownership stays in WooCommerce; worker only triggers the plugin.
 */
export async function pollShipmentsJob(_job: Job) {
  const orders = await wooRest<WooOrder[]>(
    "/orders?status=processing&per_page=30",
  );

  const wp = process.env.WORDPRESS_URL?.replace(/\/$/, "");
  const secret = process.env.JT_INTERNAL_API_SECRET;
  if (!wp || !secret) {
    console.warn("[shipments] missing config");
    return { created: 0 };
  }

  let created = 0;
  for (const order of orders) {
    if (getMeta(order, "_jt_awb")) continue;
    if (getMeta(order, "_jt_fulfilment_skip") === "1") continue;

    const res = await fetch(`${wp}/wp-json/jt-sports/v1/fulfilment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-JT-Internal-Secret": secret,
      },
      body: JSON.stringify({ order_id: order.id }),
    });

    if (res.status === 409) continue; // not eligible yet
    if (!res.ok) {
      console.error(`[shipments] create failed order=${order.id}`, await res.text());
      continue;
    }
    created += 1;
  }

  return { created };
}
