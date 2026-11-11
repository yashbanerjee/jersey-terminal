"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Check, Loader2, Package, Plane, Shirt } from "lucide-react";
import {
  CUSTOM_MOQ,
  CUSTOM_TIERS,
  FREIGHT_ZONES,
  formatUSD,
  freightTotalUsd,
  jerseySubtotalUsd,
  orderTotalUsd,
  type CustomTierId,
  type FreightZoneId,
} from "@/lib/custom-order";
import { cn } from "@/lib/format";

const TIER_ORDER: CustomTierId[] = ["basic", "premium", "luxury"];
const ZONE_ORDER: FreightZoneId[] = ["uae", "gcc", "intl"];

const ACCENT: Record<CustomTierId, string> = {
  basic: "from-jt-cyan/80 via-white/20 to-jt-neon/70",
  premium: "from-jt-neon/90 via-white/25 to-jt-orange/80",
  luxury: "from-jt-orange/95 via-jt-amber/70 to-jt-neon/70",
};

export function CustomOrderBuilder() {
  const [tier, setTier] = useState<CustomTierId>("premium");
  const [zone, setZone] = useState<FreightZoneId>("uae");
  const [qty, setQty] = useState(CUSTOM_MOQ);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [team, setTeam] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qtySafe = Math.max(CUSTOM_MOQ, Number.isFinite(qty) ? Math.floor(qty) : CUSTOM_MOQ);
  const jerseyTotal = useMemo(() => jerseySubtotalUsd(tier, qtySafe), [tier, qtySafe]);
  const freightTotal = useMemo(() => freightTotalUsd(zone, qtySafe), [zone, qtySafe]);
  const grandTotal = useMemo(() => orderTotalUsd(tier, zone, qtySafe), [tier, zone, qtySafe]);
  const active = CUSTOM_TIERS[tier];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (qtySafe < CUSTOM_MOQ) {
      setError(`Minimum order is ${CUSTOM_MOQ} jerseys.`);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          zone,
          quantity: qtySafe,
          name,
          email,
          phone,
          team,
          notes,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start checkout");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
      <div className="space-y-4">
        {TIER_ORDER.map((id) => {
          const t = CUSTOM_TIERS[id];
          const selected = tier === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setTier(id)}
              className={cn(
                "jt-chamfer w-full bg-gradient-to-br p-px text-left transition",
                ACCENT[id],
                selected ? "shadow-[0_0_40px_-12px_rgba(180,255,26,0.55)]" : "opacity-85 hover:opacity-100",
              )}
            >
              <div className="jt-chamfer bg-jt-dark p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon">
                      {t.name} kit
                    </p>
                    <h3 className="mt-1 jt-display text-2xl text-white sm:text-3xl">{t.name}</h3>
                    <p className="mt-2 max-w-xl text-sm text-white/65">{t.tagline}</p>
                  </div>
                  <div className="jt-slant bg-black/50 px-3 py-2 ring-1 ring-white/10">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-jt-muted">Per jersey</p>
                    <p className="jt-display text-xl">
                      <span className="jt-gradient-text-fire">{formatUSD(t.priceUsd)}</span>
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-xs uppercase tracking-[0.14em] text-white/45">{t.fabric}</p>
                <p className="mt-1 text-xs text-jt-cyan/90">Best for: {t.bestFor}</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {t.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-sm text-white/70">
                      <Check
                        className={cn(
                          "mt-0.5 h-4 w-4 shrink-0",
                          selected ? "text-jt-neon" : "text-white/35",
                        )}
                      />
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </button>
          );
        })}
      </div>

      <form
        onSubmit={onSubmit}
        className="jt-chamfer h-fit border border-white/10 bg-jt-dark/90 p-5 sm:sticky sm:top-24 sm:p-6"
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-orange">
          Build your order
        </p>
        <h3 className="mt-2 jt-display text-2xl text-white">Custom kit checkout</h3>
        <p className="mt-2 text-sm text-white/60">
          Minimum {CUSTOM_MOQ} jerseys. You pay jersey cost plus freight for your zone.
        </p>

        <label className="mt-5 block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
          Quantity
          <input
            type="number"
            min={CUSTOM_MOQ}
            step={1}
            value={qty}
            onChange={(e) => setQty(Number(e.target.value))}
            className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm text-white outline-none transition focus:border-jt-neon"
            required
          />
        </label>
        {qty < CUSTOM_MOQ && (
          <p className="mt-1.5 text-xs text-jt-coral">Minimum order is {CUSTOM_MOQ} jerseys.</p>
        )}

        <p className="mt-5 text-[11px] uppercase tracking-[0.18em] text-jt-muted">Freight zone</p>
        <div className="mt-2 grid gap-2">
          {ZONE_ORDER.map((id) => {
            const z = FREIGHT_ZONES[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => setZone(id)}
                className={cn(
                  "flex items-start justify-between gap-3 border px-3 py-3 text-left transition",
                  zone === id
                    ? "border-jt-neon/60 bg-jt-neon/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25",
                )}
              >
                <span>
                  <span className="block text-sm font-medium text-white">{z.label}</span>
                  <span className="mt-0.5 block text-xs text-white/50">{z.note}</span>
                </span>
                <span className="shrink-0 text-xs text-jt-amber">
                  {formatUSD(z.perJerseyUsd)}/jersey
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
          <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
            Contact name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              required
            />
          </label>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              required
            />
          </label>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
            Phone / WhatsApp
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              required
            />
          </label>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
            Team / club name
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
            />
          </label>
          <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
            Design notes
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Colours, crest files, player names…"
              className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
            />
          </label>
        </div>

        <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
          <div className="flex items-center justify-between gap-3 text-white/70">
            <span className="inline-flex items-center gap-2">
              <Shirt className="h-4 w-4 text-jt-neon" />
              {active.name} × {qtySafe}
            </span>
            <span>{formatUSD(jerseyTotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-white/70">
            <span className="inline-flex items-center gap-2">
              <Plane className="h-4 w-4 text-jt-orange" />
              Freight ({FREIGHT_ZONES[zone].label})
            </span>
            <span>{formatUSD(freightTotal)}</span>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-3 jt-display text-lg text-white">
            <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-jt-muted">
              <Package className="h-4 w-4" /> Total due
            </span>
            <span className="jt-gradient-text-aurora">{formatUSD(grandTotal)}</span>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-jt-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy || qtySafe < CUSTOM_MOQ}
          className="jt-gradient-bg mt-5 inline-flex w-full items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-jt-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Preparing Stripe…
            </>
          ) : (
            <>
              Pay jersey + freight <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
        <p className="mt-3 text-center text-[11px] leading-relaxed text-white/40">
          Secure card payment via Stripe. After payment we confirm artwork and size sheet before
          production starts.
        </p>
      </form>
    </div>
  );
}
