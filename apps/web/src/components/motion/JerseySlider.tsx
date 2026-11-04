"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductCardModel } from "@/lib/woo/types";
import { ProductCard } from "@/components/product/ProductCard";
import { ProgressDots } from "@/components/motion/ProgressDots";

type Props = {
  products: ProductCardModel[];
  intervalMs?: number;
  className?: string;
};

/**
 * One-by-one jersey carousel with a light 3D rotateY coverflow.
 * Entrance animates when the block scrolls into view.
 */
export function JerseySlider({ products, intervalMs = 3000, className = "" }: Props) {
  const reduced = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { once: true, amount: 0.35, margin: "0px 0px -10% 0px" });
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [entered, setEntered] = useState(false);
  const total = products.length;

  const go = useCallback(
    (next: number) => {
      if (!total) return;
      setIndex(((next % total) + total) % total);
    },
    [total],
  );

  // Mark entered after first in-view so autoplay waits for the intro
  useEffect(() => {
    if (!inView) return;
    if (reduced) {
      setEntered(true);
      return;
    }
    const t = window.setTimeout(() => setEntered(true), 700);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  useEffect(() => {
    if (!entered || reduced || paused || total < 2) return;
    const id = window.setInterval(() => go(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [entered, go, index, intervalMs, paused, reduced, total]);

  if (!total) return null;

  const slots = total === 1 ? [0] : total === 2 ? [-1, 0] : [-1, 0, 1];
  const show = inView || reduced;

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div
        className="relative mx-auto h-[min(72vw,440px)] w-full max-w-5xl sm:h-[480px] md:h-[520px]"
        style={{ perspective: "1200px", perspectiveOrigin: "50% 40%" }}
      >
        <div className="absolute inset-0 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
          {slots.map((offset) => {
            const i = ((index + offset) % total + total) % total;
            const product = products[i];
            const isActive = offset === 0;
            const x = offset * 240;
            const rotateY = reduced ? 0 : offset * -18;
            const scale = isActive ? 1 : 0.78;
            const opacity = isActive ? 1 : 0.4;

            return (
              <motion.div
                key={`${product.id}-${offset === 0 ? "active" : offset}`}
                className="absolute w-[min(70vw,270px)] sm:w-[290px] md:w-[310px]"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: isActive ? 30 : 10 - Math.abs(offset),
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 80,
                        rotateY: offset === 0 ? 18 : offset * -28,
                        scale: 0.75,
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
                        filter: isActive ? "brightness(1) saturate(1)" : "brightness(0.55) saturate(0.85)",
                      }
                    : {
                        opacity: 0,
                        y: 80,
                        rotateY: offset === 0 ? 18 : offset * -28,
                        scale: 0.75,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 120,
                  damping: 18,
                  mass: 0.9,
                  delay: show && !entered ? Math.abs(offset) * 0.12 : 0,
                }}
                aria-hidden={!isActive}
              >
                <div className={isActive ? "pointer-events-auto" : "pointer-events-none select-none"}>
                  <ProductCard product={product} priority={isActive} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.p
          key={products[index].id}
          initial={{ opacity: 0, y: 8 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, delay: show ? 0.35 : 0 }}
          className="mt-3 text-center text-[11px] uppercase tracking-[0.28em] text-jt-muted"
        >
          <span className="text-jt-neon">{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-2 text-white/20">/</span>
          <span className="text-white/75">{products[index].name}</span>
        </motion.p>
      </AnimatePresence>

      {total > 1 && (
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 16 }}
          animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 flex items-center justify-center gap-4"
        >
          <button
            type="button"
            aria-label="Previous jersey"
            onClick={() => go(index - 1)}
            className="jt-slant-sm grid h-10 w-10 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <ProgressDots
            size="hero"
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
            className="jt-slant-sm grid h-10 w-10 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </motion.div>
      )}
    </div>
  );
}
