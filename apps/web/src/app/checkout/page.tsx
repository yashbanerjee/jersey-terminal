"use client";

import { FormEvent, useMemo, useState } from "react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import {
  CHECKOUT_COUNTRIES,
  countryHasStates,
  stateFieldLabel,
  statesForCountry,
  wooCountryCode,
} from "@/lib/countries";

const fieldClass =
  "w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none focus:border-jt-neon";

export default function CheckoutPage() {
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState(CHECKOUT_COUNTRIES[0]?.code ?? "AE");
  const [state, setState] = useState(statesForCountry("AE")[0]?.code ?? "");

  const subdivisions = useMemo(() => statesForCountry(country), [country]);
  const needsState = countryHasStates(country);
  const stateLabel = stateFieldLabel(country);
  const dial = CHECKOUT_COUNTRIES.find((c) => c.code === country)?.dial ?? "+971";

  function onCountryChange(next: string) {
    setCountry(next);
    const nextStates = statesForCountry(next);
    setState(nextStates[0]?.code ?? "");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setStatus("");
    const fd = new FormData(e.currentTarget);
    const phoneRaw = String(fd.get("phone") || "").trim();
    const phone = phoneRaw.startsWith("+") ? phoneRaw : `${dial} ${phoneRaw}`;

    // Woo-registered countries need the state code; UAE has no Woo states so send the emirate name.
    const selectedSubdivision = subdivisions.find((s) => s.code === state);
    const stateValue = needsState
      ? country === "AE"
        ? (selectedSubdivision?.name ?? state)
        : state
      : String(fd.get("state") || "").trim();

    const billing = {
      first_name: String(fd.get("first_name") || ""),
      last_name: String(fd.get("last_name") || ""),
      address_1: String(fd.get("address_1") || ""),
      city: String(fd.get("city") || ""),
      state: stateValue,
      postcode: String(fd.get("postcode") || ""),
      country: wooCountryCode(country),
      email: String(fd.get("email") || ""),
      phone,
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          billing,
          shipping: billing,
          payment_method: "stripe",
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Checkout failed");
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      setStatus(data.message || `Order #${data.orderId} created`);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Checkout failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="jt-page jt-container w-full max-w-6xl">
      <h1 className="jt-display text-5xl tracking-wide">Checkout</h1>
      <p className="mt-2 text-sm text-jt-muted">AED pricing. Pay securely by card with Stripe.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:gap-12">
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <input name="first_name" required placeholder="First name" autoComplete="given-name" className={fieldClass} />
            <input name="last_name" required placeholder="Last name" autoComplete="family-name" className={fieldClass} />
          </div>
          <input name="email" type="email" required placeholder="Email" autoComplete="email" className={fieldClass} />

          <div className="grid gap-4 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-jt-muted">Country</span>
              <select
                name="country"
                required
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                autoComplete="country"
                className={fieldClass}
              >
                {CHECKOUT_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-jt-muted">Phone</span>
              <span className="flex">
                <span className="inline-flex shrink-0 items-center border border-r-0 border-white/15 bg-jt-surface px-3 text-sm text-jt-muted">
                  {dial}
                </span>
                <input
                  name="phone"
                  type="tel"
                  required
                  inputMode="tel"
                  autoComplete="tel-national"
                  placeholder="Mobile number"
                  className={`${fieldClass} rounded-l-none`}
                />
              </span>
            </label>
          </div>

          <input
            name="address_1"
            required
            placeholder="Delivery address"
            autoComplete="street-address"
            className={fieldClass}
          />

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-jt-muted">City</span>
              <input name="city" required placeholder="City" autoComplete="address-level2" className={fieldClass} />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs uppercase tracking-[0.16em] text-jt-muted">{stateLabel}</span>
              {needsState ? (
                <select
                  name="state"
                  required
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  autoComplete="address-level1"
                  className={fieldClass}
                >
                  {subdivisions.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name="state"
                  placeholder={stateLabel}
                  autoComplete="address-level1"
                  className={fieldClass}
                />
              )}
            </label>
          </div>

          <input name="postcode" placeholder="PO Box / Postcode" autoComplete="postal-code" className={fieldClass} />

          <fieldset className="space-y-3 border border-white/10 p-4">
            <legend className="px-2 text-xs uppercase tracking-[0.16em] text-jt-neon">Payment</legend>
            <label className="flex items-center gap-2 text-sm">
              <input type="radio" name="payment" value="stripe" checked readOnly />
              Pay by card (Stripe)
            </label>
            <p className="text-xs text-jt-muted">
              You&apos;ll be redirected to Stripe&apos;s secure checkout to complete payment.
            </p>
          </fieldset>

          <button
            type="submit"
            disabled={loading}
            className="jt-gradient-bg w-full py-3 text-sm font-semibold uppercase tracking-[0.16em] text-jt-black disabled:opacity-60"
          >
            {loading ? "Processing…" : "Continue to payment"}
          </button>
          {status && <p className="text-sm text-jt-muted">{status}</p>}
        </form>

        <OrderSummary />
      </div>
    </div>
  );
}
