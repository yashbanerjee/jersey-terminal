"use client";

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { WooProduct, WooVariation } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import { SizeGuide } from "@/components/product/SizeGuide";
import {
  EMPTY_PERSONALIZATION,
  hasPersonalization,
  PersonalizationForm,
  type PersonalizationValue,
} from "./PersonalizationForm";

export function AddToCartPanel({
  product,
  variations,
  personalization,
}: {
  product: WooProduct;
  variations: WooVariation[];
  personalization: {
    personalizationEligible: boolean;
    personalizationFee: string;
    maxNameLength: number;
  };
}) {
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [qty, setQty] = useState(1);
  const [pers, setPers] = useState<PersonalizationValue>(EMPTY_PERSONALIZATION);
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");
  const hydrateCart = useCartStore((s) => s.hydrate);
  const setOpen = useCartStore((s) => s.setOpen);

  const variation = useMemo(() => {
    if (!variations.length) return null;
    return variations.find((v) => v.attributes.every((a) => selected[a.name] === a.option)) ?? null;
  }, [variations, selected]);

  const personalised = personalization.personalizationEligible && hasPersonalization(pers);
  const basePrice = Number(variation?.price ?? product.price) || 0;
  const fee = personalised ? Number(personalization.personalizationFee) || 0 : 0;
  const total = (basePrice + fee).toFixed(2);

  async function add() {
    setStatus("loading");
    setMessage("");
    try {
      const payload: Record<string, unknown> = {
        id: variation?.id ?? product.id,
        quantity: Math.max(1, Math.min(50, qty)),
      };
      if (variations.length) {
        payload.variation = Object.entries(selected).map(([attribute, value]) => ({ attribute, value }));
      }
      if (personalised) {
        payload.personalization = {
          player_name: pers.player_name.trim(),
          jersey_number: pers.jersey_number.trim(),
          custom_text: pers.custom_text.trim(),
        };
      }

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Could not add to bag");
      }
      const cartRes = await fetch("/api/cart", { cache: "no-store" });
      const cart = await cartRes.json();
      hydrateCart({
        items: cart.items ?? [],
        totalLabel: cart.totalLabel ?? "AED 0.00",
        count: cart.count ?? 0,
      });
      setStatus("ok");
      setMessage(
        personalised
          ? `Added — we'll print ${[pers.player_name.trim(), pers.jersey_number.trim() && `#${pers.jersey_number.trim()}`]
              .filter(Boolean)
              .join(" ")}.`
          : "Added to bag",
      );
      setOpen(true);
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Error");
    }
  }

  const attrs = product.attributes.filter((a) => a.variation);
  const needsVariation = variations.length > 0 && !variation;

  return (
    <div className="space-y-6">
      {attrs.map((attr) => (
        <div key={attr.slug}>
          <p className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.16em] text-jt-muted">
            <span className="inline-flex items-center gap-3">
              {attr.name}
              {/size/i.test(attr.name) && <SizeGuide compact />}
            </span>
            {selected[attr.name] && <span className="text-white">{selected[attr.name]}</span>}
          </p>
          <div className="flex flex-wrap gap-2">
            {attr.options.map((opt) => {
              const active = selected[attr.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelected((s) => ({ ...s, [attr.name]: opt }))}
                  className={`min-w-11 rounded-lg border px-3 py-2 text-sm transition ${
                    active
                      ? "border-jt-neon bg-jt-neon/10 text-jt-neon"
                      : "border-white/15 text-white hover:border-white/40"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <label className="block text-xs uppercase tracking-[0.16em] text-jt-muted">
        Quantity
        <input
          type="number"
          min={1}
          max={50}
          value={qty}
          onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
          className="mt-2 w-24 border border-white/15 bg-jt-black px-3 py-2 text-sm text-white outline-none focus:border-jt-neon"
        />
      </label>

      {personalization.personalizationEligible && (
        <PersonalizationForm
          fee={personalization.personalizationFee}
          maxNameLength={personalization.maxNameLength}
          value={pers}
          onChange={setPers}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-jt-muted">
            {personalised ? "Total incl. printing" : "Price"}
          </p>
          <p className="jt-display text-4xl text-jt-neon">{formatAED(total)}</p>
          {personalised && (
            <p className="text-xs text-jt-muted">
              {formatAED(basePrice.toFixed(2))} jersey + {formatAED(fee.toFixed(2))} name &amp; number
            </p>
          )}
        </div>
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          disabled={status === "loading" || needsVariation}
          onClick={add}
          className="jt-gradient-bg min-h-12 w-full rounded-lg px-8 py-3 text-sm font-semibold uppercase tracking-[0.16em] text-jt-black disabled:opacity-50 sm:w-auto"
        >
          {status === "loading" ? "Adding…" : needsVariation ? "Select options" : "Add to bag"}
        </motion.button>
      </div>
      {message && (
        <p className={`text-sm ${status === "error" ? "text-red-400" : "text-jt-neon"}`}>{message}</p>
      )}
    </div>
  );
}
