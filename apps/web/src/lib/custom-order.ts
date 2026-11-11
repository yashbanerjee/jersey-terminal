export type CustomTierId = "basic" | "premium" | "luxury";

export type FreightZoneId = "uae" | "gcc" | "intl";

export const CUSTOM_MOQ = 15;

export const CUSTOM_TIERS: Record<
  CustomTierId,
  {
    id: CustomTierId;
    name: string;
    priceUsd: number;
    tagline: string;
    fabric: string;
    highlights: string[];
    bestFor: string;
  }
> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceUsd: 15,
    tagline: "Clean club kit for squads that need volume without fuss.",
    fabric: "160gsm polyester interlock · athletic fit",
    bestFor: "Academies, school teams, and large fan runs",
    highlights: [
      "Full-colour sublimation front & back",
      "Club crest + one sponsor mark",
      "Player name & number on reverse",
      "Adult sizes S–XXL (youth on request)",
      "Digital design proof before print",
      "Production lead time ~10–14 days",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium",
    priceUsd: 25,
    tagline: "Match-day finish with richer fabric and fuller branding.",
    fabric: "170gsm performance knit · moisture-wicking",
    bestFor: "Clubs, corporates, and tournament kits",
    highlights: [
      "Pro-weight breathable fabric",
      "Unlimited colour sublimation",
      "Crest, sleeve marks & multi-sponsor layout",
      "Mixed size run with size chart support",
      "Two design revision rounds",
      "Production lead time ~8–12 days",
      "Individual polybag packing",
    ],
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    priceUsd: 40,
    tagline: "Elite presentation — the closest feel to a pro match shirt.",
    fabric: "180gsm elite jersey knit · reinforced seams",
    bestFor: "Pro clubs, VIP drops, and signature collections",
    highlights: [
      "Elite GSM with heat-pressed detailing",
      "Optional embroidered crest upgrade",
      "Full player roster personalisation",
      "Dedicated design director session",
      "Priority production ~6–9 days",
      "Premium boxed delivery per kit",
      "Photo sample approval before bulk print",
    ],
  },
};

export const FREIGHT_ZONES: Record<
  FreightZoneId,
  { id: FreightZoneId; label: string; perJerseyUsd: number; note: string }
> = {
  uae: {
    id: "uae",
    label: "UAE (all emirates)",
    perJerseyUsd: 2.5,
    note: "Door-to-door via regional courier",
  },
  gcc: {
    id: "gcc",
    label: "GCC",
    perJerseyUsd: 4,
    note: "Express regional freight",
  },
  intl: {
    id: "intl",
    label: "International",
    perJerseyUsd: 6.5,
    note: "Tracked international express · duties may apply (DAP)",
  },
};

export function jerseySubtotalUsd(tier: CustomTierId, qty: number) {
  return CUSTOM_TIERS[tier].priceUsd * qty;
}

export function freightTotalUsd(zone: FreightZoneId, qty: number) {
  return FREIGHT_ZONES[zone].perJerseyUsd * qty;
}

export function orderTotalUsd(tier: CustomTierId, zone: FreightZoneId, qty: number) {
  return jerseySubtotalUsd(tier, qty) + freightTotalUsd(zone, qty);
}

export function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}
