export type CustomTierId = "basic" | "premium" | "luxury";

export type FreightZoneId = "uae" | "gcc" | "intl";

export type SponsorPlacement =
  | "chest_center"
  | "chest_left"
  | "chest_right"
  | "sleeve_left"
  | "sleeve_right"
  | "back_upper"
  | "back_lower"
  | "shorts"
  | "other";

export type PlayerKitRow = {
  name: string;
  number: string;
  size: string;
};

export type SponsorRow = {
  name: string;
  placement: SponsorPlacement;
  notes?: string;
};

export const PLAYER_SIZES = ["YS", "YM", "YL", "S", "M", "L", "XL", "XXL", "3XL"] as const;

export const SPONSOR_PLACEMENTS: Record<SponsorPlacement, string> = {
  chest_center: "Chest — center (main sponsor)",
  chest_left: "Chest — left",
  chest_right: "Chest — right",
  sleeve_left: "Left sleeve",
  sleeve_right: "Right sleeve",
  back_upper: "Back — upper",
  back_lower: "Back — lower",
  shorts: "Shorts",
  other: "Other / tell us in notes",
};

export const CUSTOM_MOQ = 15;

/** All custom kit prices in AED (aligned with retail storefront). */
export const CUSTOM_TIERS: Record<
  CustomTierId,
  {
    id: CustomTierId;
    name: string;
    priceAed: number;
    tagline: string;
    fabric: string;
    highlights: string[];
    bestFor: string;
  }
> = {
  basic: {
    id: "basic",
    name: "Basic",
    priceAed: 55,
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
    priceAed: 95,
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
    priceAed: 150,
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
  { id: FreightZoneId; label: string; perJerseyAed: number; note: string }
> = {
  uae: {
    id: "uae",
    label: "UAE (all emirates)",
    perJerseyAed: 9,
    note: "Door-to-door via regional courier",
  },
  gcc: {
    id: "gcc",
    label: "GCC",
    perJerseyAed: 15,
    note: "Express regional freight",
  },
  intl: {
    id: "intl",
    label: "International",
    perJerseyAed: 24,
    note: "Tracked international express · duties may apply (DAP)",
  },
};

export function jerseySubtotalAed(tier: CustomTierId, qty: number) {
  return CUSTOM_TIERS[tier].priceAed * qty;
}

export function freightTotalAed(zone: FreightZoneId, qty: number) {
  return FREIGHT_ZONES[zone].perJerseyAed * qty;
}

export function orderTotalAed(tier: CustomTierId, zone: FreightZoneId, qty: number) {
  return jerseySubtotalAed(tier, qty) + freightTotalAed(zone, qty);
}

/** 30% design deposit for quote / proof-first flow */
export function depositAed(tier: CustomTierId, zone: FreightZoneId, qty: number) {
  return Math.round(orderTotalAed(tier, zone, qty) * 0.3);
}

export function formatAEDMoney(amount: number) {
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(amount);
}

/** @deprecated use formatAEDMoney — kept for gradual rename */
export const formatUSD = formatAEDMoney;
