import { z } from "zod";

export const MoneySchema = z.object({
  amount: z.string(),
  currency: z.string().default("AED"),
});

export type Money = z.infer<typeof MoneySchema>;

export const ProductBadgeSchema = z.enum([
  "new",
  "bestseller",
  "limited",
  "sale",
]);

export type ProductBadge = z.infer<typeof ProductBadgeSchema>;

export const ProductImageSchema = z.object({
  id: z.number(),
  src: z.string(),
  alt: z.string().optional(),
});

export const ProductVariationSchema = z.object({
  id: z.number(),
  sku: z.string().optional(),
  price: z.string(),
  regularPrice: z.string().optional(),
  salePrice: z.string().nullable().optional(),
  stockStatus: z.enum(["instock", "outofstock", "onbackorder"]),
  stockQuantity: z.number().nullable().optional(),
  attributes: z.record(z.string()),
  image: ProductImageSchema.optional(),
});

export const ProductSchema = z.object({
  id: z.number(),
  slug: z.string(),
  name: z.string(),
  type: z.enum(["simple", "variable", "grouped", "external"]),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  price: z.string(),
  regularPrice: z.string().optional(),
  salePrice: z.string().nullable().optional(),
  onSale: z.boolean().optional(),
  stockStatus: z.enum(["instock", "outofstock", "onbackorder"]).optional(),
  images: z.array(ProductImageSchema).default([]),
  categories: z
    .array(z.object({ id: z.number(), name: z.string(), slug: z.string() }))
    .default([]),
  attributes: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string(),
        slug: z.string(),
        options: z.array(z.string()),
        variation: z.boolean().optional(),
      }),
    )
    .default([]),
  variations: z.array(ProductVariationSchema).optional(),
  badges: z.array(ProductBadgeSchema).optional(),
  personalizationEligible: z.boolean().optional(),
  averageRating: z.string().optional(),
  reviewCount: z.number().optional(),
});

export type Product = z.infer<typeof ProductSchema>;

export const CategorySlug = {
  JERSEYS: "jerseys",
  MATCH_KITS: "match-kits",
  TRAINING_WEAR: "training-wear",
  FAN_MERCHANDISE: "fan-merchandise",
  ACCESSORIES: "accessories",
  SPORTS_BAGS: "sports-bags",
  CAPS: "caps",
  LIMITED_EDITIONS: "limited-editions",
  SALE: "sale",
} as const;

export const PaymentMethod = {
  STRIPE: "stripe",
} as const;
