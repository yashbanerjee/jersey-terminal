import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import { wooStore, jtSports } from "@/lib/woo/client";
import { getStoreSession, persistStoreSession } from "@/lib/woo/session";

export const dynamic = "force-dynamic";

/**
 * Headless checkout via WooCommerce Store API.
 * Stripe is the only supported payment method: prefer the official Woo Stripe
 * payment method on the order; fallback creates a JT plugin Checkout Session.
 */
export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    billing: Record<string, string>;
    shipping: Record<string, string>;
    payment_method?: string;
    customer_note?: string;
  };

  if (body.payment_method && body.payment_method !== "stripe") {
    return NextResponse.json(
      { ok: false, error: "Only Stripe card payment is available." },
      { status: 400 },
    );
  }

  const session = await getStoreSession();

  try {
    // Update customer address on cart
    await wooStore("/cart/update-customer", {
      method: "POST",
      session,
      body: JSON.stringify({
        billing_address: body.billing,
        shipping_address: body.shipping,
      }),
    });

    const checkout = await wooStore<{
      order_id: number;
      status: string;
      order_key: string;
      payment_result?: {
        payment_status: string;
        redirect_url?: string;
      };
    }>("/checkout", {
      method: "POST",
      session,
      body: JSON.stringify({
        billing_address: body.billing,
        shipping_address: body.shipping,
        payment_method: "stripe",
        customer_note: body.customer_note ?? "",
      }),
    });

    await persistStoreSession({
      cartToken: checkout.cartToken,
      nonce: checkout.nonce,
    });

    const orderId = checkout.data.order_id;
    let redirectUrl = checkout.data.payment_result?.redirect_url;

    // Fallback headless Stripe connector if Store API did not return a redirect
    if (!redirectUrl && orderId) {
      try {
        const sessionRes = await jtSports<{ id: string; url: string | null }>(
          "/stripe/create-checkout-session",
          {
            method: "POST",
            headers: {
              "X-JT-Internal-Secret": env.internalSecret,
            },
            body: JSON.stringify({
              order_id: orderId,
              success_url: `${env.siteUrl}/checkout/success?order=${orderId}`,
              cancel_url: `${env.siteUrl}/checkout/cancel?order=${orderId}`,
            }),
          },
        );
        redirectUrl = sessionRes.url ?? undefined;
      } catch {
        // Official plugin path may still mark order pending payment
      }
    }

    return NextResponse.json({
      ok: true,
      orderId,
      status: checkout.data.status,
      redirectUrl,
      // Frontend success URL is never proof of payment — webhooks confirm
      message: "Continue to Stripe to complete payment.",
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Checkout failed" },
      { status: 400 },
    );
  }
}
