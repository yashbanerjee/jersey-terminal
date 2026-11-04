function required(name: string, value: string | undefined): string {
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`Missing env: ${name}`);
    }
    return "";
  }
  return value;
}

export const env = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  wordpressUrl: process.env.WORDPRESS_URL ?? "http://localhost:8080",
  wordpressApiUrl:
    process.env.WORDPRESS_API_URL ??
    `${process.env.WORDPRESS_URL ?? "http://localhost:8080"}/wp-json`,
  wooKey: process.env.WOOCOMMERCE_CONSUMER_KEY ?? "",
  wooSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET ?? "",
  wooWebhookSecret: process.env.WOOCOMMERCE_WEBHOOK_SECRET ?? "",
  stripePublishable:
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ??
    process.env.STRIPE_PUBLISHABLE_KEY ??
    "",
  stripeSecret: process.env.STRIPE_SECRET_KEY ?? "",
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? "",
  redisUrl: process.env.REDIS_URL ?? "",
  revalidateSecret: process.env.REVALIDATE_SECRET ?? "",
  internalSecret: process.env.JT_INTERNAL_API_SECRET ?? "",
};

export function assertServerSecrets() {
  required("WORDPRESS_URL", env.wordpressUrl);
}
