/**
 * Match jersey: lifestyle shots so shoppers see the kit on players.
 * Flat mockups stay as trailing gallery images for print/detail closeups.
 * Training jersey keeps official flat mockups.
 */

const MATCH = [
  "/products/united-tigers/match-life-01.webp",
  "/products/united-tigers/match-life-02.webp",
  "/products/united-tigers/match-life-03.webp",
  "/products/united-tigers/match-life-04.webp",
  "/products/united-tigers/match-01.webp",
  "/products/united-tigers/match-02.webp",
];

const TRAIN = [
  "/products/united-tigers/train-01.webp",
  "/products/united-tigers/train-02.webp",
  "/products/united-tigers/train-03.webp",
  "/products/united-tigers/train-04.webp",
  "/products/united-tigers/train-05.webp",
];

const BY_SLUG: Record<string, string[]> = {
  "united-tiger-match-jersey": MATCH,
  "united-tiger-training-jersey": TRAIN,
};

export function overrideProductImageSrcs(
  slug: string,
  images: Array<{ id: number; src: string; alt?: string }>,
) {
  const overrides = BY_SLUG[slug];
  if (!overrides?.length) return images;
  return overrides.map((src, i) => ({
    id: images[i]?.id ?? i + 1,
    src,
    alt: images[i]?.alt || slug,
  }));
}

export function overrideCardImage(slug: string, fallback?: { src: string; alt: string }) {
  const overrides = BY_SLUG[slug];
  if (!overrides?.length) return fallback;
  return { src: overrides[0], alt: fallback?.alt || slug };
}
