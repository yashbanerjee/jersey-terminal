import type { ProductCardModel, WooProduct, WooVariation } from "./types";

/** Grouping/marketing categories that make poor card labels. */
const GENERIC_CATEGORIES = new Set(["collections", "featured", "new-arrivals", "uncategorized", "sale"]);

export function displayCategory(categories?: Array<{ slug: string; name: string }>): string | undefined {
  if (!categories?.length) return undefined;
  return (categories.find((c) => !GENERIC_CATEGORIES.has(c.slug)) ?? categories[0]).name;
}

type StorePrice = {
  price: string;
  regular_price: string;
  sale_price: string;
  currency_minor_unit?: number;
};

type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  description?: string;
  short_description?: string;
  sku?: string;
  on_sale?: boolean;
  prices?: StorePrice;
  images?: Array<{ id: number; src: string; alt?: string; name?: string }>;
  categories?: Array<{ id: number; name: string; slug: string }>;
  tags?: Array<{ id: number; name: string; slug: string }>;
  attributes?: Array<{
    id?: number;
    name: string;
    taxonomy?: string;
    has_variations?: boolean;
    terms?: Array<{ id: number; name: string; slug: string }>;
  }>;
  average_rating?: string;
  review_count?: number;
  is_in_stock?: boolean;
  variation?: string;
  parent?: number;
};

function money(prices?: StorePrice): string {
  if (!prices?.price) return "0";
  const minor = prices.currency_minor_unit ?? 2;
  return (Number(prices.price) / 10 ** minor).toFixed(2);
}

export function storeToWooProduct(p: StoreProduct): WooProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: "publish",
    description: p.description ?? "",
    short_description: p.short_description ?? "",
    sku: p.sku ?? "",
    price: money(p.prices),
    regular_price: money({
      ...p.prices!,
      price: p.prices?.regular_price ?? p.prices?.price ?? "0",
    }),
    sale_price: p.on_sale
      ? money({
          ...p.prices!,
          price: p.prices?.sale_price ?? p.prices?.price ?? "0",
        })
      : "",
    on_sale: Boolean(p.on_sale),
    stock_status: p.is_in_stock === false ? "outofstock" : "instock",
    stock_quantity: null,
    average_rating: p.average_rating ?? "0",
    rating_count: p.review_count ?? 0,
    images: (p.images ?? []).map((img) => ({
      id: img.id,
      src: img.src,
      alt: img.alt || img.name || p.name,
    })),
    categories: p.categories ?? [],
    tags: p.tags ?? [],
    attributes: (p.attributes ?? []).map((a) => ({
      id: a.id ?? 0,
      name: a.name,
      slug: a.taxonomy?.replace(/^pa_/, "") || a.name.toLowerCase(),
      options: (a.terms ?? []).map((t) => t.name),
      variation: Boolean(a.has_variations),
    })),
    variations: [],
  };
}

export function storeToVariation(p: StoreProduct): WooVariation {
  const attrs: Array<{ id: number; name: string; option: string }> = [];
  if (p.variation) {
    for (const part of p.variation.split(",")) {
      const [name, option] = part.split(":").map((s) => s.trim());
      if (name && option) attrs.push({ id: 0, name, option });
    }
  }
  return {
    id: p.id,
    sku: p.sku ?? "",
    price: money(p.prices),
    regular_price: money({
      ...p.prices!,
      price: p.prices?.regular_price ?? p.prices?.price ?? "0",
    }),
    sale_price: "",
    on_sale: Boolean(p.on_sale),
    stock_status: p.is_in_stock === false ? "outofstock" : "instock",
    stock_quantity: null,
    image: p.images?.[0]
      ? { id: p.images[0].id, src: p.images[0].src, alt: p.images[0].alt }
      : null,
    attributes: attrs,
  };
}

export function storeToCard(p: StoreProduct): ProductCardModel {
  const woo = storeToWooProduct(p);
  const badges: ProductCardModel["badges"] = [];
  if (woo.on_sale) badges.push("sale");
  const cats = new Set((p.categories ?? []).map((c) => c.slug));
  if (cats.has("new-arrivals")) badges.push("new");
  if (cats.has("featured")) badges.push("bestseller");
  if (cats.has("limited-editions") || cats.has("limited")) badges.push("limited");
  return {
    id: woo.id,
    slug: woo.slug,
    name: woo.name,
    price: woo.price,
    regularPrice: woo.regular_price,
    salePrice: woo.sale_price || null,
    onSale: woo.on_sale,
    image: woo.images[0]
      ? { src: woo.images[0].src, alt: woo.images[0].alt || woo.name }
      : undefined,
    badges,
    category: displayCategory(woo.categories),
  };
}
