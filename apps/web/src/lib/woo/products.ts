import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import { wooRest, wooStore, jtSports } from "./client";
import { displayCategory, storeToCard, storeToVariation, storeToWooProduct } from "./store-map";
import type { ProductCardModel, WooProduct, WooVariation } from "./types";

function hasRestAuth() {
  return Boolean(env.wooKey && env.wooSecret);
}

function badgesFromProduct(p: WooProduct): ProductCardModel["badges"] {
  const badges: ProductCardModel["badges"] = [];
  if (p.on_sale) badges.push("sale");
  const tagSlugs = new Set(p.tags?.map((t) => t.slug) ?? []);
  if (tagSlugs.has("new") || tagSlugs.has("new-arrivals")) badges.push("new");
  if (tagSlugs.has("bestseller") || tagSlugs.has("best-sellers")) {
    badges.push("bestseller");
  }
  if (
    tagSlugs.has("limited") ||
    p.categories?.some((c) => c.slug === "limited-editions")
  ) {
    badges.push("limited");
  }
  const cats = new Set(p.categories?.map((c) => c.slug) ?? []);
  if (cats.has("new-arrivals")) badges.push("new");
  if (cats.has("featured")) badges.push("bestseller");
  return [...new Set(badges)];
}

export function toCard(p: WooProduct): ProductCardModel {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    price: p.price,
    regularPrice: p.regular_price,
    salePrice: p.sale_price || null,
    onSale: p.on_sale,
    image: p.images?.[0]
      ? { src: p.images[0].src, alt: p.images[0].alt || p.name }
      : undefined,
    badges: badgesFromProduct(p),
    category: displayCategory(p.categories),
  };
}

async function listViaStore(params: {
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
  orderby?: string;
  featured?: boolean;
  onSale?: boolean;
}): Promise<ProductCardModel[]> {
  const q = new URLSearchParams();
  q.set("per_page", String(params.perPage ?? 12));
  q.set("page", String(params.page ?? 1));
  if (params.category) q.set("category", params.category);
  if (params.search) q.set("search", params.search);
  if (params.orderby) q.set("orderby", params.orderby);
  if (params.featured) q.set("featured", "true");
  if (params.onSale) q.set("on_sale", "true");

  const { data } = await wooStore<unknown[]>(`/products?${q}`, {
    next: { revalidate: 120, tags: ["products"] },
  } as RequestInit & { session?: undefined });
  return (data as Parameters<typeof storeToCard>[0][]).map(storeToCard);
}

async function listProductsUncached(params: {
  category?: string;
  tag?: string;
  featured?: boolean;
  onSale?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  orderby?: string;
}): Promise<ProductCardModel[]> {
  try {
    if (!hasRestAuth()) {
      return listViaStore(params);
    }

    const q = new URLSearchParams();
    q.set("status", "publish");
    q.set("per_page", String(params.perPage ?? 12));
    q.set("page", String(params.page ?? 1));
    if (params.category) q.set("category", params.category);
    if (params.tag) q.set("tag", params.tag);
    if (params.featured) q.set("featured", "true");
    if (params.onSale) q.set("on_sale", "true");
    if (params.search) q.set("search", params.search);
    if (params.orderby) q.set("orderby", params.orderby);

    const products = await wooRest<WooProduct[]>(`/products?${q}`, {
      next: { revalidate: 120, tags: ["products"] },
    });
    return products.map(toCard);
  } catch {
    try {
      return listViaStore(params);
    } catch {
      return [];
    }
  }
}

/** Cached catalogue listing — skips live Woo on repeat page views. */
export async function listProducts(params: {
  category?: string;
  tag?: string;
  featured?: boolean;
  onSale?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
  orderby?: string;
}): Promise<ProductCardModel[]> {
  // Searches stay live; everything else is cached briefly.
  if (params.search?.trim()) {
    return listProductsUncached(params);
  }

  const key = [
    "products",
    params.category ?? "",
    params.tag ?? "",
    params.featured ? "1" : "0",
    params.onSale ? "1" : "0",
    String(params.page ?? 1),
    String(params.perPage ?? 12),
    params.orderby ?? "date",
  ];

  return unstable_cache(
    () => listProductsUncached(params),
    key,
    { revalidate: 120, tags: ["products"] },
  )();
}

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  return unstable_cache(
    async () => {
      try {
        if (!hasRestAuth()) {
          const { data } = await wooStore<unknown[]>(
            `/products?slug=${encodeURIComponent(slug)}`,
            { next: { revalidate: 120, tags: ["products", `product-slug-${slug}`] } },
          );
          const first = (data as Parameters<typeof storeToWooProduct>[0][])[0];
          return first ? storeToWooProduct(first) : null;
        }
        const products = await wooRest<WooProduct[]>(
          `/products?slug=${encodeURIComponent(slug)}`,
          { next: { revalidate: 120, tags: ["products", `product-slug-${slug}`] } },
        );
        return products[0] ?? null;
      } catch {
        try {
          const { data } = await wooStore<unknown[]>(
            `/products?slug=${encodeURIComponent(slug)}`,
            { next: { revalidate: 120, tags: ["products", `product-slug-${slug}`] } },
          );
          const first = (data as Parameters<typeof storeToWooProduct>[0][])[0];
          return first ? storeToWooProduct(first) : null;
        } catch {
          return null;
        }
      }
    },
    ["product-slug", slug],
    { revalidate: 120, tags: ["products", `product-slug-${slug}`] },
  )();
}

export async function getProductVariations(
  productId: number,
): Promise<WooVariation[]> {
  return unstable_cache(
    async () => {
      try {
        if (!hasRestAuth()) {
          const { data } = await wooStore<unknown[]>(
            `/products?type=variation&parent=${productId}&per_page=100`,
            { next: { revalidate: 120, tags: ["products", `product-${productId}`] } },
          );
          return (data as Parameters<typeof storeToVariation>[0][]).map(
            storeToVariation,
          );
        }
        return await wooRest<WooVariation[]>(
          `/products/${productId}/variations?per_page=100`,
          { next: { revalidate: 120, tags: ["products", `product-${productId}`] } },
        );
      } catch {
        try {
          const { data } = await wooStore<unknown[]>(
            `/products?type=variation&parent=${productId}&per_page=100`,
            { next: { revalidate: 120, tags: ["products", `product-${productId}`] } },
          );
          return (data as Parameters<typeof storeToVariation>[0][]).map(
            storeToVariation,
          );
        } catch {
          return [];
        }
      }
    },
    ["product-variations", String(productId)],
    { revalidate: 120, tags: ["products", `product-${productId}`] },
  )();
}

async function getCategoriesUncached() {
  try {
    if (!hasRestAuth()) {
      const { data } = await wooStore<
        Array<{ id: number; name: string; slug: string; count: number }>
      >("/products/categories?per_page=100", {
        next: { revalidate: 300, tags: ["categories"] },
      });
      return data.filter((c) => c.slug !== "uncategorized");
    }
    return await wooRest<
      Array<{ id: number; name: string; slug: string; count: number }>
    >("/products/categories?per_page=100&hide_empty=true", {
      next: { revalidate: 300, tags: ["categories"] },
    });
  } catch {
    try {
      const { data } = await wooStore<
        Array<{ id: number; name: string; slug: string; count: number }>
      >("/products/categories?per_page=100", {
        next: { revalidate: 300, tags: ["categories"] },
      });
      return data.filter((c) => c.slug !== "uncategorized");
    } catch {
      return [];
    }
  }
}

export async function getCategories() {
  return unstable_cache(getCategoriesUncached, ["categories"], {
    revalidate: 300,
    tags: ["categories"],
  })();
}

export async function getProductExtensions(productId: number) {
  try {
    return await jtSports<{
      personalizationEligible: boolean;
      personalizationFee: string;
      maxNameLength: number;
    }>(`/product/${productId}/extensions`);
  } catch {
    return {
      personalizationEligible: false,
      personalizationFee: "25.00",
      maxNameLength: 12,
    };
  }
}

/**
 * Homepage data in one product round-trip.
 * Previously fired 3 product list requests every page load.
 */
export async function getHomepageCollections() {
  return unstable_cache(
    async () => {
      try {
        const all = await listProductsUncached({ orderby: "date", perPage: 24 });
        const featuredNames = new Set([
          "united-tiger-match-jersey",
          "united-tiger-training-jersey",
        ]);

        const newestRaw = all.filter((p) => p.badges.includes("new"));
        const limitedRaw = all.filter(
          (p) => p.badges.includes("limited") || p.badges.includes("bestseller"),
        );

        const newest = newestRaw.length > 0 ? newestRaw.slice(0, 12) : all.slice(0, 12);
        const limited =
          limitedRaw.length > 0
            ? limitedRaw.slice(0, 12)
            : all.filter((p) => featuredNames.has(p.slug));

        return { newest, limited, all };
      } catch {
        return { newest: [], limited: [], all: [] };
      }
    },
    ["homepage-collections"],
    { revalidate: 120, tags: ["products", "categories"] },
  )();
}
