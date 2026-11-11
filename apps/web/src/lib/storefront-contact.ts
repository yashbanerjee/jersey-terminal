import "server-only";
import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import {
  contactFromEnv,
  contactFromParts,
  type StorefrontContact,
} from "@/lib/site";

async function fetchWordpressContact(): Promise<StorefrontContact | null> {
  const bases = [env.wordpressUrl, env.wordpressPublicUrl]
    .map((u) => u.replace(/\/$/, ""))
    .filter(Boolean);
  const unique = [...new Set(bases)];

  for (const base of unique) {
    try {
      const res = await fetch(`${base}/wp-json/jt-sports/v1/storefront-contact`, {
        next: { revalidate: 60 },
        headers: { Accept: "application/json" },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (!text.trim() || text.trimStart().startsWith("<")) continue;
      const data = JSON.parse(text) as {
        whatsappNumber?: string;
        email?: string;
        phone?: string;
        city?: string;
        brand?: string;
      };
      return contactFromParts(data);
    } catch {
      // try next base
    }
  }
  return null;
}

/**
 * Prefer WooCommerce → JT Sports admin settings.
 * Fall back to NEXT_PUBLIC_* env vars. Never invent a placeholder WhatsApp number.
 */
export async function getStorefrontContact(): Promise<StorefrontContact> {
  return unstable_cache(
    async () => {
      const fromWp = await fetchWordpressContact();
      if (fromWp && (fromWp.whatsappEnabled || fromWp.email || fromWp.phone)) {
        // Merge env only for fields WP left blank
        const envContact = contactFromEnv();
        return contactFromParts({
          brand: fromWp.brand,
          email: fromWp.email || envContact.email,
          phone: fromWp.phone || envContact.phone,
          city: fromWp.city || envContact.city,
          whatsappNumber: fromWp.whatsappNumber || envContact.whatsappNumber,
        });
      }
      return contactFromEnv();
    },
    ["jt-storefront-contact"],
    { revalidate: 60, tags: ["storefront-contact"] },
  )();
}
