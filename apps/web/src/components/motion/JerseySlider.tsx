"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { ProductCard } from "@/components/product/ProductCard";
import { ProgressDots } from "@/components/motion/ProgressDots";
import { SlideImpact } from "@/components/motion/SlideImpact";

type Props = {
  products: ProductCardModel[];
  intervalMs?: number;
  className?: string;
};

/**
 * Playing-card coverflow — jerseys fan in 3D like a dealt hand.
 * Name/price sit below so mobile never overlaps the deck.
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
    const t = window.setTimeout(() => setEntered(true), 750);
    return () => window.clearTimeout(t);
  }, [inView, reduced]);

  useEffect(() => {
    if (!entered || reduced || paused || total < 2) return;
    const id = window.setInterval(() => go(index + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [entered, go, index, intervalMs, paused, reduced, total]);

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
  const spread = narrow ? 102 : 168;

  return (
    <div
      ref={rootRef}
      className={`relative w-full ${className}`}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") setPaused(true);
      }}
      onPointerLeave={() => setPaused(false)}
    >
      <div
        className="relative mx-auto w-full max-w-5xl"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 45%" }}
      >
        {/* Soft table shadow under the deck */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-[72%] h-10 w-[min(70%,320px)] -translate-x-1/2 rounded-[100%] bg-black/50 blur-2xl"
        />

        <div
          className="relative mx-auto aspect-[5/7] w-[min(58vw,210px)] overflow-visible sm:w-[240px] md:w-[260px] lg:w-[280px]"
          style={{ transformStyle: "preserve-3d" }}
        >
          {entered && <SlideImpact triggerKey={index} />}
          {slots.map((offset) => {
            const i = ((index + offset) % total + total) % total;
            const product = products[i];
            const isActive = offset === 0;
            const x = offset * spread;
            // Deeper fan — side cards stay readable so the deck fills the band
            const rotateY = reduced ? 0 : offset * -32;
            const rotateZ = reduced ? 0 : offset * 5;
            const rotateX = reduced ? 0 : isActive ? -4 : 6;
            const y = isActive ? -10 : 18;
            const z = isActive ? 110 : -70;
            const scale = isActive ? 1.02 : 0.8;
            const opacity = isActive ? 1 : 0.55;

            return (
              <motion.div
                key={`${product.id}-${offset === 0 ? "active" : offset}`}
                className="absolute inset-0 w-full"
                style={{
                  transformStyle: "preserve-3d",
                  zIndex: isActive ? 30 : 10 - Math.abs(offset),
                  transformOrigin: "50% 100%",
                }}
                initial={
                  reduced
                    ? false
                    : {
                        opacity: 0,
                        y: 100,
                        rotateY: offset === 0 ? 40 : offset * -50,
                        rotateZ: offset * 12,
                        z: -120,
                        scale: 0.7,
                      }
                }
                animate={
                  show
                    ? {
                        x,
                        y,
                        z,
                        rotateX,
                        rotateY,
                        rotateZ,
                        scale,
                        opacity,
                        filter: isActive
                          ? "brightness(1.08) saturate(1.1)"
                          : "brightness(0.48) saturate(0.7)",
                      }
                    : {
                        opacity: 0,
                        y: 110,
                        rotateY: offset === 0 ? 48 : offset * -56,
                        z: -140,
                        scale: 0.68,
                      }
                }
                transition={{
                  type: "spring",
                  stiffness: 100,
                  damping: 15,
                  mass: 0.9,
                  delay: show && !entered ? Math.abs(offset) * 0.14 : 0,
                }}
                aria-hidden={!isActive}
              >
                <motion.div
                  className={isActive ? "pointer-events-auto" : "pointer-events-none select-none"}
                  animate={
                    isActive && show && !reduced
                      ? { y: [0, -10, 0], rotateZ: [0, 1.2, 0], rotateY: [0, 3, 0, -3, 0] }
                      : { y: 0, rotateZ: 0, rotateY: 0 }
                  }
                  transition={
                    isActive
                      ? { duration: 4.2, repeat: Infinity, ease: "easeInOut" }
                      : { duration: 0.3 }
                  }
                >
                  <ProductCard product={product} priority={isActive} mediaOnly />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
          animate={show ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: 14 }}
          exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
          transition={{ duration: 0.38, delay: show ? 0.1 : 0, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-20 mt-6 px-3 text-center sm:mt-7"
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
          <motion.button
            type="button"
            aria-label="Previous jersey"
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => go(index - 1)}
            className="jt-slant-sm grid h-9 w-9 shrink-0 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon sm:h-10 sm:w-10"
          >
            <ChevronLeft className="h-4 w-4" />
          </motion.button>

          <ProgressDots
            size="compact"
            count={total}
            index={index}
            durationMs={intervalMs}
            paused={paused || !!reduced || !entered}
            onSelect={go}
            labels={products.map((p) => p.name)}
          />

          <motion.button
            type="button"
            aria-label="Next jersey"
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => go(index + 1)}
            className="jt-slant-sm grid h-9 w-9 shrink-0 place-items-center border border-white/15 bg-jt-black/60 text-white backdrop-blur transition hover:border-jt-neon hover:text-jt-neon sm:h-10 sm:w-10"
          >
            <ChevronRight className="h-4 w-4" />
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
