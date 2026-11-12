/**
 * Official United Tigers jersey mockups from unitedtigers.ae.
 * Kept as local assets so the storefront never shows squad/player photos
 * as product imagery (those live only in the Squad gallery).
 */

const MATCH = [
  "/products/united-tigers/match-01.webp",
  "/products/united-tigers/match-02.webp",
  "/products/united-tigers/match-03.webp",
  "/products/united-tigers/match-04.webp",
  "/products/united-tigers/match-05.webp",
  "/products/united-tigers/match-06.webp",
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
