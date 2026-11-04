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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-full flex-col border-l border-white/10 bg-jt-dark shadow-2xl sm:max-w-md"
            initial={{ x: "100%", opacity: 0.6 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: "100%", opacity: 0.6 }}
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.85 }}
          >
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.35 }}
              className="flex items-center justify-between border-b border-white/10 px-5 py-4"
            >
              <h2 className="jt-display text-2xl tracking-wide">Your Bag</h2>
              <motion.button
                type="button"
                whileHover={{ scale: 1.08, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOpen(false)}
                className="rounded-full p-2 hover:bg-white/5"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </motion.button>
            </motion.div>

            <div data-lenis-prevent className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-jt-muted"
                >
                  Your bag is empty.
                </motion.p>
              ) : (
                items.map((item, i) => (
                  <motion.div
                    key={item.key}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="flex gap-3 border-b border-white/5 pb-4"
                  >
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
                  </motion.div>
                ))
              )}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.4 }}
              className="border-t border-white/10 p-5"
            >
              <div className="mb-4 flex justify-between text-sm">
                <span className="text-jt-muted">Subtotal</span>
                <span>{totalLabel}</span>
              </div>
              <motion.div whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/checkout"
                  onClick={() => setOpen(false)}
                  className="jt-gradient-bg flex w-full items-center justify-center py-3 text-sm font-semibold uppercase tracking-wider text-jt-black transition-shadow hover:shadow-[0_0_28px_-6px_rgba(180,255,26,0.7)]"
                >
                  Checkout
                </Link>
              </motion.div>
            </motion.div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
