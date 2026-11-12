import type { ProductCardModel } from "@/lib/woo/types";

/** Shown when WooCommerce is unreachable so the storefront never looks empty. */
export const FALLBACK_HERO_PRODUCTS: ProductCardModel[] = [
  {
    id: -1,
    slug: "united-tiger-match-jersey",
    name: "United Tiger Match Jersey",
    price: "100.00",
    regularPrice: "100.00",
    salePrice: null,
    onSale: false,
    image: {
      src: "/products/united-tigers/match-life-01.webp",
      alt: "United Tiger Match Jersey",
    },
    badges: ["new"],
    category: "Jerseys",
  },
  {
    id: -2,
    slug: "united-tiger-training-jersey",
    name: "United Tiger Training Jersey",
    price: "90.00",
    regularPrice: "90.00",
    salePrice: null,
    onSale: false,
    image: {
      src: "/products/united-tigers/train-01.webp",
      alt: "United Tiger Training Jersey",
    },
    badges: ["new"],
    category: "Jerseys",
  },
];
