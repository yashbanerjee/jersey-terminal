/** Public storefront contact + sales channels. */

export type StorefrontContact = {
  brand: string;
  email: string;
  phone: string;
  city: string;
  /** Digits only with country code, or empty */
  whatsappNumber: string;
  whatsappEnabled: boolean;
};

export const EMPTY_CONTACT: StorefrontContact = {
  brand: "Jersey Terminal",
  email: "",
  phone: "",
  city: "",
  whatsappNumber: "",
  whatsappEnabled: false,
};

export function normalizeWhatsApp(raw: string | undefined | null) {
  return (raw || "").replace(/\D/g, "");
}

export function contactFromParts(input: {
  email?: string;
  phone?: string;
  city?: string;
  whatsappNumber?: string;
  brand?: string;
}): StorefrontContact {
  const whatsappNumber = normalizeWhatsApp(input.whatsappNumber);
  return {
    brand: input.brand?.trim() || "Jersey Terminal",
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    city: (input.city || "").trim(),
    whatsappNumber,
    whatsappEnabled: whatsappNumber.length >= 10,
  };
}

/** Env-only fallback (used if WordPress contact endpoint is empty/unavailable). */
export function contactFromEnv(): StorefrontContact {
  return contactFromParts({
    email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "",
    phone: process.env.NEXT_PUBLIC_SUPPORT_PHONE || "",
    city: process.env.NEXT_PUBLIC_SUPPORT_CITY || "",
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "",
  });
}

export function whatsappUrl(number: string, message?: string) {
  const digits = normalizeWhatsApp(number);
  if (digits.length < 10) return "";
  const base = `https://wa.me/${digits}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}

export const WHATSAPP_DEFAULT_MESSAGE =
  "Hi Jersey Terminal — I want help with a jersey / team kit order.";
