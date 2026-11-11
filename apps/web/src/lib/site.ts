/** Public storefront contact + sales channels (safe for client). */

export const SITE = {
  brand: "Jersey Terminal",
  email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "hello@jerseyterminal.com",
  phoneDisplay: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "+971 50 000 0000",
  /** Digits only, country code included — e.g. 971501234567 */
  whatsappNumber: (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "971501234567").replace(/\D/g, ""),
  city: "Dubai, UAE",
} as const;

export function whatsappUrl(message?: string) {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Jersey Terminal — I want help with a jersey / team kit order.";
