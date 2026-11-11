"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { PenLine } from "lucide-react";
import { PersonalizationTag } from "@/components/cart/PersonalizationTag";
import { useCartStore } from "@/store/cart";

/** Live cart summary for the checkout page, highlighting what will be printed. */
export function OrderSummary() {
  const { items, totalLabel, hydrate, loading, setLoading } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/cart", { cache: "no-store" });
        const data = await res.json();
        if (!cancelled) {
          hydrate({
            items: data.items ?? [],
            totalLabel: data.totalLabel ?? "AED 0.00",
            count: data.count ?? 0,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrate, setLoading]);

  const printed = items.filter((i) => i.personalization);

  return (
    <aside className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 lg:sticky lg:top-28">
      <h2 className="jt-display text-2xl tracking-wide">Your order</h2>

      <div className="mt-4 space-y-4">
        {items.length === 0 && !loading && (
          <p className="text-sm text-jt-muted">
            Your bag is empty.{" "}
            <Link href="/shop" className="text-jt-neon underline-offset-4 hover:underline">
              Browse jerseys
            </Link>
          </p>
        )}
        {items.map((item) => (
          <div key={item.key} className="flex gap-3">
            <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg bg-jt-surface">
              {item.image && <Image src={item.image} alt={item.name} fill sizes="64px" className="object-cover" />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium">{item.name}</p>
                <p className="shrink-0 text-sm text-white">{item.priceLabel}</p>
              </div>
              <p className="mt-0.5 text-xs text-jt-muted">
                {[...(item.variation ?? []).map((v) => `${v.name}: ${v.value}`), `Qty ${item.quantity}`].join(" · ")}
              </p>
              <PersonalizationTag personalization={item.personalization} />
            </div>
          </div>
        ))}
      </div>

      {printed.length > 0 && (
        <div className="mt-5 flex gap-2 rounded-lg border border-jt-neon/30 bg-jt-neon/5 p-3 text-xs text-jt-muted">
          <PenLine className="mt-0.5 h-3.5 w-3.5 shrink-0 text-jt-neon" />
          <p>
            Names and numbers are printed exactly as entered and personalised jerseys can&apos;t be returned.
            Please check the spelling above before paying.
          </p>
        </div>
      )}

      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <span className="text-sm text-jt-muted">Total</span>
        <span className="jt-display text-2xl text-jt-neon">{totalLabel}</span>
      </div>
      <p className="mt-1 text-[11px] text-jt-muted">
        UAE courier from ~AED 15 · GCC / international rates confirmed on the Stripe / Woo step.
      </p>
    </aside>
  );
}
