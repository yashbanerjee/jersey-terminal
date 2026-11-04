export function formatAED(amount: string | number) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "AED —";
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency: "AED",
    minimumFractionDigits: 2,
  }).format(value);
}

/** Store API often returns minor units as strings (e.g. "19900" for 199.00). */
export function formatStoreMinor(amount: string, currency = "AED") {
  const n = Number(amount);
  if (Number.isNaN(n)) return `${currency} —`;
  return new Intl.NumberFormat("en-AE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n / 100);
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
