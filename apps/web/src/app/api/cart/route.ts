import { NextRequest, NextResponse } from "next/server";
import { wooStore } from "@/lib/woo/client";
import { getStoreSession, persistStoreSession } from "@/lib/woo/session";
import type { StoreCart } from "@/lib/woo/types";
import { formatStoreMinor } from "@/lib/format";

export const dynamic = "force-dynamic";

/** Pull the JT personalization lines out of the Store API `item_data`. */
function mapPersonalization(itemData?: StoreCart["items"][number]["item_data"]) {
  if (!itemData?.length) return undefined;
  const get = (key: string) => itemData.find((d) => d.key === key)?.value || undefined;
  const playerName = get("jt_player_name");
  const jerseyNumber = get("jt_jersey_number");
  const customText = get("jt_custom_text");
  if (!playerName && !jerseyNumber && !customText) return undefined;
  return { playerName, jerseyNumber, customText };
}

export async function GET() {
  try {
    const session = await getStoreSession();
    const { data, cartToken, nonce } = await wooStore<StoreCart>("/cart", {
      session,
    });
    await persistStoreSession({ cartToken, nonce });
    return NextResponse.json({
      items: data.items.map((i) => ({
        key: i.key,
        id: i.id,
        name: i.name,
        quantity: i.quantity,
        priceLabel: formatStoreMinor(i.prices.price, i.prices.currency_code),
        image: i.images?.[0]?.src,
        variation: (i.variation ?? []).map((v) => ({ name: v.attribute, value: v.value })),
        personalization: mapPersonalization(i.item_data),
      })),
      totalLabel: formatStoreMinor(
        data.totals.total_price,
        data.totals.currency_code,
      ),
      count: data.items.reduce((n, i) => n + i.quantity, 0),
    });
  } catch (e) {
    return NextResponse.json(
      {
        items: [],
        totalLabel: "AED 0.00",
        count: 0,
        error: e instanceof Error ? e.message : "Cart unavailable",
      },
      { status: 200 },
    );
  }
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as {
    id: number;
    quantity?: number;
    variation?: Array<{ attribute: string; value: string }>;
    personalization?: {
      player_name?: string;
      jersey_number?: string;
      custom_text?: string;
    };
  };

  const session = await getStoreSession();
  const payload: Record<string, unknown> = {
    id: body.id,
    quantity: body.quantity ?? 1,
  };
  if (body.variation?.length) payload.variation = body.variation;
  // Personalization passed as cart item data for the JT plugin
  if (body.personalization) {
    payload.jt_personalization = body.personalization;
  }

  try {
    const { data, cartToken, nonce } = await wooStore<StoreCart>("/cart/add-item", {
      method: "POST",
      session,
      body: JSON.stringify(payload),
    });
    await persistStoreSession({ cartToken, nonce });
    return NextResponse.json({ ok: true, cart: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Add failed" },
      { status: 400 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  const body = (await req.json()) as { key: string; quantity: number };
  const session = await getStoreSession();
  try {
    const { data, cartToken, nonce } = await wooStore<StoreCart>(
      `/cart/items/${body.key}`,
      {
        method: "POST",
        session,
        body: JSON.stringify({ quantity: body.quantity }),
      },
    );
    await persistStoreSession({ cartToken, nonce });
    return NextResponse.json({ ok: true, cart: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Update failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  const body = (await req.json()) as { key: string };
  const session = await getStoreSession();
  try {
    const { data, cartToken, nonce } = await wooStore<StoreCart>(
      `/cart/items/${body.key}`,
      { method: "DELETE", session },
    );
    await persistStoreSession({ cartToken, nonce });
    return NextResponse.json({ ok: true, cart: data });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "Remove failed" },
      { status: 400 },
    );
  }
}
