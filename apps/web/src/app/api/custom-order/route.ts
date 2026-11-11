import { NextResponse } from "next/server";
import { z } from "zod";
import { env } from "@/lib/env";
import {
  CUSTOM_MOQ,
  CUSTOM_TIERS,
  FREIGHT_ZONES,
  depositAed,
  freightTotalAed,
  jerseySubtotalAed,
  orderTotalAed,
  type CustomTierId,
  type FreightZoneId,
} from "@/lib/custom-order";
import { saveCustomBrief } from "@/lib/custom-order-store";

export const runtime = "nodejs";

const playerSchema = z.object({
  name: z.string().trim().min(1).max(40),
  number: z.string().trim().min(1).max(3),
  size: z.string().trim().min(1).max(8),
});

const sponsorSchema = z.object({
  name: z.string().trim().min(1).max(80),
  placement: z.enum([
    "chest_center",
    "chest_left",
    "chest_right",
    "sleeve_left",
    "sleeve_right",
    "back_upper",
    "back_lower",
    "shorts",
    "other",
  ]),
  notes: z.string().trim().max(200).optional().default(""),
});

const bodySchema = z.object({
  tier: z.enum(["basic", "premium", "luxury"]),
  zone: z.enum(["uae", "gcc", "intl"]),
  quantity: z.number().int().min(CUSTOM_MOQ).max(120),
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(160),
  phone: z.string().trim().min(6).max(40),
  teamName: z.string().trim().min(2).max(120),
  primaryColor: z.string().trim().max(40).optional().default(""),
  secondaryColor: z.string().trim().max(40).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  logoDataUrl: z.string().max(2_500_000).optional().default(""),
  players: z.array(playerSchema).min(CUSTOM_MOQ).max(120),
  sponsors: z.array(sponsorSchema).max(8).optional().default([]),
  /** full = pay jersey+freight now; deposit = 30% design deposit */
  payMode: z.enum(["full", "deposit"]).optional().default("full"),
});

function toFils(aed: number) {
  return Math.round(aed * 100);
}

function orderRef() {
  return `JT-KIT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const data = bodySchema.parse(json);

    if (data.players.length !== data.quantity) {
      return NextResponse.json(
        { error: `Add exactly ${data.quantity} player rows (one per jersey).` },
        { status: 400 },
      );
    }

    const tier = data.tier as CustomTierId;
    const zone = data.zone as FreightZoneId;
    const tierMeta = CUSTOM_TIERS[tier];
    const zoneMeta = FREIGHT_ZONES[zone];
    const jersey = jerseySubtotalAed(tier, data.quantity);
    const freight = freightTotalAed(zone, data.quantity);
    const full = orderTotalAed(tier, zone, data.quantity);
    const charge = data.payMode === "deposit" ? depositAed(tier, zone, data.quantity) : full;
    const secret = env.stripeSecret;

    if (!secret) {
      return NextResponse.json(
        { error: "Stripe is not configured on this environment yet." },
        { status: 503 },
      );
    }

    const ref = orderRef();
    await saveCustomBrief({
      orderRef: ref,
      tier,
      zone,
      quantity: data.quantity,
      contactName: data.name,
      email: data.email,
      phone: data.phone,
      teamName: data.teamName,
      primaryColor: data.primaryColor,
      secondaryColor: data.secondaryColor,
      notes: data.notes,
      logoDataUrl: data.logoDataUrl || undefined,
      players: data.players,
      sponsors: data.sponsors,
      createdAt: new Date().toISOString(),
    });

    const Stripe = (await import("stripe")).default;
    const stripe = new Stripe(secret);

    const rosterPreview = data.players
      .slice(0, 8)
      .map((p) => `${p.number} ${p.name}`)
      .join(", ");
    const sponsorPreview = data.sponsors
      .map((s) => `${s.name} (${s.placement})`)
      .join("; ")
      .slice(0, 400);

    const lineItems =
      data.payMode === "deposit"
        ? [
            {
              quantity: 1,
              price_data: {
                currency: "aed",
                unit_amount: toFils(charge),
                product_data: {
                  name: `${data.teamName} — design deposit (30%)`,
                  description: `${tierMeta.name} kit · ${data.quantity} shirts · proof before bulk print · balance due after approval`,
                },
              },
            },
          ]
        : [
            {
              quantity: data.quantity,
              price_data: {
                currency: "aed",
                unit_amount: toFils(tierMeta.priceAed),
                product_data: {
                  name: `${data.teamName} — ${tierMeta.name} custom jersey`,
                  description: `Team kit · ${data.quantity} shirts · logo + player names/numbers`,
                },
              },
            },
            {
              quantity: 1,
              price_data: {
                currency: "aed",
                unit_amount: toFils(freight),
                product_data: {
                  name: `Freight — ${zoneMeta.label}`,
                  description: `${data.quantity} × AED ${zoneMeta.perJerseyAed.toFixed(2)} · ${zoneMeta.note}`,
                },
              },
            },
          ];

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: data.email,
      success_url: `${env.siteUrl}/custom/success?session_id={CHECKOUT_SESSION_ID}&ref=${encodeURIComponent(ref)}`,
      cancel_url: `${env.siteUrl}/custom?cancelled=1`,
      client_reference_id: ref,
      metadata: {
        type: "custom_team_kit",
        order_ref: ref,
        pay_mode: data.payMode,
        tier,
        zone,
        quantity: String(data.quantity),
        contact_name: data.name.slice(0, 120),
        phone: data.phone.slice(0, 40),
        team_name: data.teamName.slice(0, 120),
        has_logo: data.logoDataUrl ? "1" : "0",
        sponsors: sponsorPreview || "none",
        roster_preview: rosterPreview.slice(0, 450),
        currency: "AED",
        full_total_aed: String(full),
        charged_aed: String(charge),
      },
      line_items: lineItems,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 502 });
    }

    return NextResponse.json({
      url: session.url,
      orderRef: ref,
      jerseyTotal: jersey,
      freightTotal: freight,
      charged: charge,
      currency: "AED",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid custom order";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
