export type WooImage = {
  id: number;
  src: string;
  name?: string;
  alt?: string;
};

export type WooProduct = {
  id: number;
  name: string;
  slug: string;
  type: string;
  status: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  average_rating: string;
  rating_count: number;
  images: WooImage[];
  categories: Array<{ id: number; name: string; slug: string }>;
  tags: Array<{ id: number; name: string; slug: string }>;
  attributes: Array<{
    id: number;
    name: string;
    slug: string;
    options: string[];
    variation: boolean;
  }>;
  variations: number[];
  meta_data?: Array<{ key: string; value: unknown }>;
};

export type WooVariation = {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  image: WooImage | null;
  attributes: Array<{ id: number; name: string; option: string }>;
};

export type StoreCart = {
  items: Array<{
    key: string;
    id: number;
    quantity: number;
    name: string;
    prices: { price: string; currency_code: string };
    images?: Array<{ src: string; alt?: string }>;
    variation?: Array<{ attribute: string; value: string }>;
    item_data?: Array<{ key?: string; name: string; value: string }>;
  }>;
  totals: {
    total_items: string;
    total_price: string;
    currency_code: string;
  };
  coupons: Array<{ code: string }>;
};

export type ProductCardModel = {
  id: number;
  slug: string;
  name: string;
  price: string;
  regularPrice: string;
  salePrice: string | null;
  onSale: boolean;
  image?: { src: string; alt: string };
  badges: Array<"new" | "bestseller" | "limited" | "sale">;
  category?: string;
};
