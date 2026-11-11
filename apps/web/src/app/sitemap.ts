import type { MetadataRoute } from "next";
import { env } from "@/lib/env";
import { listProducts } from "@/lib/woo/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl.replace(/\/$/, "");
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/custom`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/shop/jerseys`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/shop/training-wear`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/track`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/shipping`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${base}/contact`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/returns`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  try {
    const products = await listProducts({ perPage: 100, orderby: "date" });
    const productRoutes = products.map((p) => ({
      url: `${base}/product/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}
