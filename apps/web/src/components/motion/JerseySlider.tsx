"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";
import { ProgressDots } from "@/components/motion/ProgressDots";

type Props = {
  products: ProductCardModel[];
  intervalMs?: number;
  className?: string;
};

/**
 * One-by-one jersey carousel with a light 3D rotateY coverflow.
 * Cards are media-only; name/price live below so mobile never overlaps.
 */
export function JerseySlider({ products, intervalMs = 3000, className = "" }: Props) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.3, margin: "0px 0px -8% 0px" });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(false);
  const [narrow, setNarrow] = useState(true);
  const total = products.length;
  const active = products[index];

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const sync = () => setNarrow(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setEntered(true);
      return;
    }
    const t = window.setTimeout(() => setEntered(true), 700);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  // Keep autoplay alive; only pause for mouse hover / reduced motion
  useEffect(() => {
    if (!entered || reduced || paused || total < 2) return;
    const id = window.setInterval(() => go(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [entered, go, index, intervalMs, paused, reduced, total]);

  // Resume if the tab was backgrounded (browsers throttle timers)
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  if (!total || !active) return null;

  const slots = total === 1 ? [0] : total === 2 ? [-1, 0] : [-1, 0, 1];
  const show = inView || reduced;
  const spread = narrow ? 132 : 220;

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Full-width stage; card size drives height so caption never collides */}
      <div
        className="relative mx-auto w-full max-w-5xl"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
      >
        <div
          className="relative mx-auto aspect-[3/4] w-[min(68vw,240px)] overflow-visible sm:w-[280px] md:w-[300px] lg:w-[320px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {slots.map((offset) => {
            const i = ((index + offset) % total + total) % total;
            const product = products[i];
            const isActive = offset === 0;
            const x = offset * spread;
            const rotateY = reduced ? 0 : offset * -16;
            const scale = isActive ? 1 : 0.76;
            const opacity = isActive ? 1 : 0.32;

            return (
              <motion.div
                key={`${product.id}-${offset === 0 ? "active" : offset}`}
                className="absolute inset-0 w-full"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: isActive ? 30 : 10 - Math.abs(offset),
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 70,
                        rotateY: offset === 0 ? 14 : offset * -24,
                        scale: 0.78,
                      }
                }
                animate={
                  show
                    ? {
                        x,
                        y: 0,
                        rotateY,
                        scale,
                        opacity,
                        filter: isActive ? "brightness(1) saturate(1)" : "brightness(0.5) saturate(0.8)",
                      }
                    : {
                        opacity: 0,
                        y: 70,
                        rotateY: offset === 0 ? 14 : offset * -24,
                        scale: 0.78,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  mass: 0.9,
                  delay: show && !entered ? Math.abs(offset) * 0.1 : 0,
                }}
                aria-hidden={!isActive}
              >
                <div className={isActive ? "pointer-events-auto" : "pointer-events-none select-none"}>
                  <ProductCard product={product} priority={isActive} mediaOnly />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Caption — single source of name/price */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, delay: show ? 0.15 : 0 }}
          className="relative z-20 mt-5 px-3 text-center sm:mt-6"
        >
          <p className="text-[10px] uppercase tracking-[0.28em] text-jt-muted sm:text-[11px]">
            <span className="text-jt-neon">{String(index + 1).padStart(2, "0")}</span>
            <span className="mx-2 text-white/20">/</span>
            <span className="text-white/70">{active.category || "Jersey"}</span>
          </p>
          <h3 className="mt-1.5 break-words jt-display text-[clamp(1.25rem,5vw,1.875rem)] leading-tight text-white">
            {active.name}
          </h3>
          <p className="mt-2 text-sm font-semibold text-white sm:text-base">{formatAED(active.price)}</p>
        </motion.div>
      </AnimatePresence>

      {total > 1 && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 mt-4 flex items-center justify-center gap-3 sm:mt-5 sm:gap-4"
        >
          <button
            type="button"
            aria-label="Previous jersey"
            onClick={() => go(index - 1)}
            className="jt-slant-sm grid h-9 w-9 shrink-0 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <ProgressDots
            size="compact"
            count={total}
            index={index}
            durationMs={intervalMs}
            paused={paused || !!reduced || !entered}
            onSelect={go}
            labels={products.map((p) => p.name)}
          />

          <button
            type="button"
            aria-label="Next jersey"
            onClick={() => go(index + 1)}
            className="jt-slant-sm grid h-9 w-9 shrink-0 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
