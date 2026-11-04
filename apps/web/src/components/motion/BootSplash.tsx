"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState, type ReactNode } from "react";
import { lockScroll } from "@/components/motion/SmoothScroll";

type Phase = "boot" | "reveal" | "done";

/**
 * First-load branded splash — logo + neon rings, then the site flies in.
 * Covers the whole app until fonts/window are ready (with a short minimum).
 */
export function BootSplash({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (reduce) {
      setPhase("done");
      return;
    }

    let cancelled = false;
    let raf = 0;
    const started = performance.now();
    const minMs = 1600;

    lockScroll(true);

    // Fake progress while we wait — feels alive even on fast local loads
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - started) / minMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setProgress(Math.min(0.92, eased * 0.92));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    async function finish() {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {
        /* ignore */
      }

      if (document.readyState !== "complete") {
        await new Promise<void>((resolve) => {
          window.addEventListener("load", () => resolve(), { once: true });
        });
      }

      const elapsed = performance.now() - started;
      if (elapsed < minMs) {
        await new Promise((r) => setTimeout(r, minMs - elapsed));
      }

      if (cancelled) return;
      cancelAnimationFrame(raf);
      setProgress(1);
      setPhase("reveal");

      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("done");
        lockScroll(false);
      }, 780);
    }

    void finish();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      lockScroll(false);
    };
  }, [reduce]);

  const showSplash = phase === "boot" || phase === "reveal";
  const contentLive = phase === "reveal" || phase === "done";

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="jt-boot"
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-jt-black"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } }}
            animate={
              phase === "reveal"
                ? { opacity: 0, scale: 1.06, filter: "blur(12px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            aria-busy={phase === "boot"}
            aria-live="polite"
          >
            {/* Atmosphere */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(180,255,26,0.16),transparent_50%),radial-gradient(ellipse_at_70%_70%,rgba(255,122,26,0.18),transparent_45%),radial-gradient(ellipse_at_25%_75%,rgba(46,230,255,0.12),transparent_40%)]"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute left-[-20%] top-[42%] h-[2px] w-[140%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(180,255,26,0.55),rgba(255,122,26,0.45),transparent)] blur-[1px]"
            />

            <div className="relative flex flex-col items-center gap-8 px-6">
              {/* Orbit rings */}
              <div className="relative grid place-items-center">
                <motion.span
                  aria-hidden
                  className="absolute h-40 w-40 rounded-full border border-jt-neon/35 sm:h-48 sm:w-48"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                  style={{
                    borderTopColor: "rgba(180,255,26,0.9)",
                    borderRightColor: "transparent",
                    boxShadow: "0 0 40px -8px rgba(180,255,26,0.55)",
                  }}
                />
                <motion.span
                  aria-hidden
                  className="absolute h-52 w-52 rounded-full border border-jt-orange/30 sm:h-60 sm:w-60"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 11, repeat: Infinity, ease: "linear" }}
                  style={{
                    borderBottomColor: "rgba(255,122,26,0.85)",
                    borderLeftColor: "transparent",
                    boxShadow: "0 0 50px -10px rgba(255,122,26,0.45)",
                  }}
                />
                <motion.span
                  aria-hidden
                  className="absolute h-28 w-28 rounded-full bg-[radial-gradient(circle,rgba(180,255,26,0.22),transparent_70%)] blur-md sm:h-32 sm:w-32"
                  animate={{ scale: [0.9, 1.12, 0.9], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                  className="relative z-10 grid h-24 w-24 place-items-center sm:h-28 sm:w-28"
                  initial={{ scale: 0.7, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 160, damping: 14 }}
                >
                  <Image
                    src="/brand/jt-mark.png"
                    alt="Jersey Terminal"
                    width={112}
                    height={112}
                    priority
                    className="h-full w-full object-contain drop-shadow-[0_0_28px_rgba(180,255,26,0.55)]"
                  />
                </motion.div>
              </div>

              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.55 }}
              >
                <p className="jt-display text-2xl tracking-wide text-white sm:text-3xl">
                  <span className="jt-gradient-text-aurora">Jersey Terminal</span>
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.32em] text-jt-muted">
                  Loading the drop
                </p>
              </motion.div>

              {/* Progress rail */}
              <div className="h-1 w-48 overflow-hidden rounded-full bg-white/10 sm:w-56">
                <motion.div
                  className="h-full rounded-full jt-gradient-bg"
                  style={{ width: `${Math.round(progress * 100)}%` }}
                  transition={{ type: "spring", stiffness: 120, damping: 20 }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex min-h-full w-full flex-1 flex-col"
        initial={reduce ? false : { opacity: 0, y: 72, scale: 0.94, filter: "blur(18px)" }}
        animate={
          contentLive || reduce
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 72, scale: 0.94, filter: "blur(18px)" }
        }
        transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: phase === "reveal" ? 0.08 : 0 }}
        style={{ transformOrigin: "50% 20%" }}
      >
        {children}
      </motion.div>
    </>
  );
}
