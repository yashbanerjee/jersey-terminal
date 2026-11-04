"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { PersonalizationTag } from "@/components/cart/PersonalizationTag";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { useCartStore } from "@/store/cart";

export function CartDrawer() {
  const { open, setOpen, items, totalLabel, hydrate, setLoading } = useCartStore();

  useEffect(() => {
    let cancelled = false;
    async function load() {
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
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [hydrate, setLoading, open]);

  useEffect(() => {
    lockScroll(open);
    return () => lockScroll(false);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close cart overlay"
            className="fixed inset-0 z-[60] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-white/10 bg-jt-dark shadow-2xl sm:max-w-md"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="jt-display text-2xl tracking-wide">
                Your Bag
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-white/5"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div data-lenis-prevent className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <p className="text-sm text-jt-muted">Your bag is empty.</p>
              ) : (
                items.map((item) => (
                  <div key={item.key} className="flex gap-3 border-b border-white/5 pb-4">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-jt-surface">
                      {item.image && (
                        <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="mt-1 text-xs text-jt-muted">
                        {[...(item.variation ?? []).map((v) => `${v.name}: ${v.value}`), `Qty ${item.quantity}`].join(
                          " · ",
                        )}
                      </p>
                      <PersonalizationTag personalization={item.personalization} />
                      <p className="mt-2 text-sm text-jt-neon">{item.priceLabel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="border-t border-white/10 p-5">
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-jt-muted">Subtotal</span>
                <span>{totalLabel}</span>
              </div>
              <Link
                href="/checkout"
                onClick={() => setOpen(false)}
                className="jt-gradient-bg flex w-full items-center justify-center py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
              >
                Checkout
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
