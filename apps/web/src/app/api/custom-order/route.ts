import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  CUSTOM_MOQ,
  CUSTOM_TIERS,
  FREIGHT_ZONES,
  freightTotalUsd,
  jerseySubtotalUsd,
  type CustomTierId,
  type FreightZoneId,
} from "@/lib/custom-order";

export const runtime = "nodejs";

const bodySchema = z.object({
  tier: z.enum(["basic", "premium", "luxury"]),
  zone: z.enum(["uae", "gcc", "intl"]),
  quantity: z.number().int().min(CUSTOM_MOQ).max(5000),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40),
  team: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
});

function toCents(usd: number) {
  return Math.round(usd * 100);
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);
    const tier = data.tier as CustomTierId;
    const zone = data.zone as FreightZoneId;
    const tierMeta = CUSTOM_TIERS[tier];
    const zoneMeta = FREIGHT_ZONES[zone];

    const jersey = jerseySubtotalUsd(tier, data.quantity);
    const freight = freightTotalUsd(zone, data.quantity);
    const secret = env.stripeSecret;

    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured on this environment yet." },
        { status: 503 },
      );
    }

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      success_url: `${env.siteUrl}/custom/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.siteUrl}/custom?cancelled=1`,
      metadata: {
        type: "custom_bulk_jersey",
        tier,
        zone,
        quantity: String(data.quantity),
        name: data.name,
        phone: data.phone,
        team: data.team || "",
        notes: data.notes.slice(0, 450),
      },
      line_items: [
        {
          quantity: data.quantity,
          price_data: {
            currency: "usd",
            unit_amount: toCents(tierMeta.priceUsd),
            product_data: {
              name: `Custom ${tierMeta.name} Jersey`,
              description: `${tierMeta.tagline} · MOQ ${CUSTOM_MOQ}`,
            },
          },
        },
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: toCents(freight),
            product_data: {
              name: `Freight — ${zoneMeta.label}`,
              description: `${formatNote(data.quantity, zoneMeta.perJerseyUsd)} · ${zoneMeta.note}`,
            },
          },
        },
      ],
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.json({
      url: session.url,
      jerseyTotal: jersey,
      freightTotal: freight,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid custom order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

function formatNote(qty: number, per: number) {
  return `${qty} × $${per.toFixed(2)} per jersey`;
}
