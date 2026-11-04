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
    next: { revalidate: 30, tags: ["products"] },
  } as RequestInit & { session?: undefined });
  return (data as Parameters<typeof storeToCard>[0][]).map(storeToCard);
}

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
      next: { revalidate: 60, tags: ["products"] },
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

export async function getProductBySlug(slug: string): Promise<WooProduct | null> {
  try {
    if (!hasRestAuth()) {
      const { data } = await wooStore<unknown[]>(
        `/products?slug=${encodeURIComponent(slug)}`,
      );
      const first = (data as Parameters<typeof storeToWooProduct>[0][])[0];
      return first ? storeToWooProduct(first) : null;
    }
    const products = await wooRest<WooProduct[]>(
      `/products?slug=${encodeURIComponent(slug)}`,
      { next: { revalidate: 60, tags: ["products", `product-slug-${slug}`] } },
    );
    return products[0] ?? null;
  } catch {
    try {
      const { data } = await wooStore<unknown[]>(
        `/products?slug=${encodeURIComponent(slug)}`,
      );
      const first = (data as Parameters<typeof storeToWooProduct>[0][])[0];
      return first ? storeToWooProduct(first) : null;
    } catch {
      return null;
    }
  }
}

export async function getProductVariations(
  productId: number,
): Promise<WooVariation[]> {
  try {
    if (!hasRestAuth()) {
      const { data } = await wooStore<unknown[]>(
        `/products?type=variation&parent=${productId}&per_page=100`,
      );
      return (data as Parameters<typeof storeToVariation>[0][]).map(
        storeToVariation,
      );
    }
    return await wooRest<WooVariation[]>(
      `/products/${productId}/variations?per_page=100`,
      { next: { revalidate: 60, tags: ["products", `product-${productId}`] } },
    );
  } catch {
    try {
      const { data } = await wooStore<unknown[]>(
        `/products?type=variation&parent=${productId}&per_page=100`,
      );
      return (data as Parameters<typeof storeToVariation>[0][]).map(
        storeToVariation,
      );
    } catch {
      return [];
    }
  }
}

export async function getCategories() {
  try {
    if (!hasRestAuth()) {
      const { data } = await wooStore<
        Array<{ id: number; name: string; slug: string; count: number }>
      >("/products/categories?per_page=100");
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
      >("/products/categories?per_page=100");
      return data.filter((c) => c.slug !== "uncategorized");
    } catch {
      return [];
    }
  }
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

export async function getHomepageCollections() {
  const cats = await getCategories();
  const newId = cats.find((c) => c.slug === "new-arrivals")?.id;
  const limitedId = cats.find(
    (c) => c.slug === "limited-editions" || c.slug === "limited",
  )?.id;
  const featuredId = cats.find((c) => c.slug === "featured")?.id;

  const [newest, limitedRaw, all] = await Promise.all([
    listProducts({
      category: newId ? String(newId) : undefined,
      orderby: "date",
      perPage: 12,
    }),
    listProducts({
      category: limitedId
        ? String(limitedId)
        : featuredId
          ? String(featuredId)
          : undefined,
      featured: !limitedId,
      perPage: 12,
    }),
    listProducts({ orderby: "date", perPage: 24 }),
  ]);

  // If limited category is empty, fall back to featured / top of catalog
  const limited =
    limitedRaw.length > 0
      ? limitedRaw
      : all.filter((p) =>
          ["champions-edition", "shadow-strike-jersey", "velocity-jersey"].includes(
            p.slug,
          ),
        );

  return { newest, limited, all };
}
