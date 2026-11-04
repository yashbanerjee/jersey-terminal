"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { lockScroll } from "@/components/motion/SmoothScroll";

type Phase = "boot" | "reveal" | "done";

const STATUS = ["Warming floodlights", "Lacing the drop", "Unlocking kits", "Ready for kickoff"];

/**
 * Cinematic first-load splash — stadium energy, pulsing JT mark, then the site flies in.
 */
export function BootSplash({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const sparks = useMemo(
    () =>
      Array.from({ length: 18 }).map((_, i) => ({
        id: i,
        left: `${6 + ((i * 17) % 88)}%`,
        delay: (i % 9) * 0.18,
        duration: 2.4 + (i % 5) * 0.35,
        size: 2 + (i % 3),
        color: i % 3 === 0 ? "#b4ff1a" : i % 3 === 1 ? "#ff7a1a" : "#2ee6ff",
      })),
    [],
  );

  useEffect(() => {
    if (reduce) {
      setPhase("done");
      return;
    }

    let cancelled = false;
    let raf = 0;
    const started = performance.now();
    const minMs = 2200;

    lockScroll(true);

    const statusTimer = window.setInterval(() => {
      setStatusIdx((i) => (i + 1) % STATUS.length);
    }, 520);

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - started) / minMs);
      const eased = 1 - Math.pow(1 - t, 2.6);
      setProgress(Math.min(0.94, eased * 0.94));
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
      window.clearInterval(statusTimer);
      setProgress(1);
      setStatusIdx(STATUS.length - 1);
      setPhase("reveal");

      window.setTimeout(() => {
        if (cancelled) return;
        setPhase("done");
        lockScroll(false);
      }, 900);
    }

    void finish();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(statusTimer);
      lockScroll(false);
    };
  }, [reduce]);

  const showSplash = phase === "boot" || phase === "reveal";
  const contentLive = phase === "reveal" || phase === "done";
  const pct = Math.round(progress * 100);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            key="jt-boot"
            className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-jt-black"
            initial={{ opacity: 1 }}
            animate={
              phase === "reveal"
                ? { opacity: 0, scale: 1.08, y: -40, filter: "blur(16px)" }
                : { opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }
            }
            exit={{ opacity: 0 }}
            transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
            aria-busy={phase === "boot"}
            aria-live="polite"
          >
            {/* Stadium plate */}
            <div
              aria-hidden
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-35"
              style={{ backgroundImage: "url(/bg/stadium-night.jpg)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(5,6,7,0.2),rgba(5,6,7,0.92)_70%),linear-gradient(180deg,rgba(5,6,7,0.55),rgba(5,6,7,0.95))]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(180,255,26,0.18),transparent_34%),radial-gradient(circle_at_78%_58%,rgba(255,122,26,0.22),transparent_38%),radial-gradient(circle_at_22%_70%,rgba(46,230,255,0.14),transparent_36%)]"
            />

            {/* Speed streaks */}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[-30%] top-[28%] h-[3px] w-[160%] -rotate-[20deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.85),transparent)] blur-[1px]"
              animate={{ x: ["-8%", "8%", "-8%"], opacity: [0.35, 0.9, 0.35] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              aria-hidden
              className="pointer-events-none absolute left-[-30%] top-[62%] h-[4px] w-[160%] -rotate-[20deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.9),transparent)] blur-[1.5px]"
              animate={{ x: ["6%", "-10%", "6%"], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Rising sparks */}
            {sparks.map((s) => (
              <motion.span
                key={s.id}
                aria-hidden
                className="pointer-events-none absolute bottom-[-5%] rounded-full"
                style={{
                  left: s.left,
                  width: s.size,
                  height: s.size * 3,
                  background: s.color,
                  boxShadow: `0 0 10px ${s.color}`,
                }}
                initial={{ y: 0, opacity: 0 }}
                animate={{ y: "-110vh", opacity: [0, 1, 0] }}
                transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}
              />
            ))}

            {/* Scan line */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 h-24 bg-[linear-gradient(180deg,transparent,rgba(180,255,26,0.08),transparent)]"
              animate={{ top: ["-10%", "110%"] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}
            />

            <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6">
              {/* Logo stage */}
              <div className="relative mb-8 grid place-items-center sm:mb-10">
                <motion.span
                  aria-hidden
                  className="absolute h-[9.5rem] w-[9.5rem] rounded-full sm:h-[11.5rem] sm:w-[11.5rem]"
                  style={{
                    background:
                      "conic-gradient(from 0deg, rgba(180,255,26,0.95), rgba(46,230,255,0.55), rgba(255,122,26,0.95), rgba(255,176,32,0.7), rgba(180,255,26,0.95))",
                    mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                    WebkitMask:
                      "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: "linear" }}
                />
                <motion.span
                  aria-hidden
                  className="absolute h-[11.5rem] w-[11.5rem] rounded-full border border-white/10 sm:h-[13.5rem] sm:w-[13.5rem]"
                  animate={{ rotate: -360, scale: [1, 1.04, 1] }}
                  transition={{
                    rotate: { duration: 7, repeat: Infinity, ease: "linear" },
                    scale: { duration: 2.2, repeat: Infinity, ease: "easeInOut" },
                  }}
                />
                <motion.span
                  aria-hidden
                  className="absolute h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(180,255,26,0.35),transparent_65%)] blur-2xl sm:h-48 sm:w-48"
                  animate={{ opacity: [0.45, 1, 0.45], scale: [0.85, 1.15, 0.85] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                  className="relative z-10"
                  initial={{ scale: 0.55, opacity: 0, rotate: -18, y: 24 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0, y: 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 12, mass: 0.7 }}
                >
                  <motion.div
                    className="jt-chamfer relative bg-[linear-gradient(135deg,rgba(46,230,255,0.95),rgba(255,255,255,0.35)_35%,rgba(255,122,26,0.95))] p-[2px] shadow-[0_0_60px_-8px_rgba(180,255,26,0.75)]"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <div className="jt-chamfer grid h-28 w-28 place-items-center bg-jt-black sm:h-32 sm:w-32">
                      <Image
                        src="/brand/jt-mark.png"
                        alt="Jersey Terminal"
                        width={96}
                        height={96}
                        priority
                        className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_24px_rgba(180,255,26,0.65)] sm:h-24 sm:w-24"
                      />
                    </div>
                  </motion.div>
                </motion.div>
              </div>

              {/* Wordmark + status */}
              <motion.div
                className="mb-8 text-center sm:mb-10"
                initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="jt-display text-[clamp(1.75rem,5vw,2.75rem)] leading-none tracking-wide">
                  <span className="jt-gradient-text-steel">Jersey</span>{" "}
                  <span className="jt-gradient-text-fire">Terminal</span>
                </p>
                <div className="mt-3 flex items-center justify-center gap-2">
                  <span className="jt-pulse inline-block h-1.5 w-1.5 rounded-full bg-jt-neon shadow-[0_0_12px_rgba(180,255,26,0.9)]" />
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={STATUS[statusIdx]}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28 }}
                      className="text-[11px] uppercase tracking-[0.34em] text-jt-muted"
                    >
                      {STATUS[statusIdx]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </motion.div>

              {/* Progress HUD */}
              <motion.div
                className="w-full max-w-xs"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                <div className="mb-2 flex items-end justify-between">
                  <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">Boot sequence</span>
                  <span className="jt-display text-lg leading-none">
                    <span className="jt-gradient-text-aurora">{String(pct).padStart(2, "0")}</span>
                    <span className="text-white/35">%</span>
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10">
                  <motion.div
                    className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#b4ff1a,#2ee6ff_45%,#ff7a1a)] shadow-[0_0_20px_rgba(180,255,26,0.55)]"
                    style={{ width: `${pct}%` }}
                  />
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 w-16 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.55),transparent)]"
                    animate={{ left: ["-20%", "120%"] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                  />
                </div>
                <div className="mt-3 flex justify-between text-[9px] uppercase tracking-[0.2em] text-white/30">
                  <span>Stadium</span>
                  <span>Kits</span>
                  <span>Live</span>
                </div>
              </motion.div>
            </div>

            {/* Corner brackets */}
            <span aria-hidden className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l-2 border-t-2 border-jt-neon/50 sm:left-8 sm:top-8" />
            <span aria-hidden className="pointer-events-none absolute right-5 top-5 h-10 w-10 border-r-2 border-t-2 border-jt-orange/50 sm:right-8 sm:top-8" />
            <span aria-hidden className="pointer-events-none absolute bottom-5 left-5 h-10 w-10 border-b-2 border-l-2 border-jt-cyan/40 sm:bottom-8 sm:left-8" />
            <span aria-hidden className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b-2 border-r-2 border-jt-neon/40 sm:bottom-8 sm:right-8" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex min-h-full w-full flex-1 flex-col"
        initial={reduce ? false : { opacity: 0, y: 90, scale: 0.92, filter: "blur(22px)" }}
        animate={
          contentLive || reduce
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
            : { opacity: 0, y: 90, scale: 0.92, filter: "blur(22px)" }
        }
        transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: phase === "reveal" ? 0.05 : 0 }}
        style={{ transformOrigin: "50% 12%" }}
      >
        {children}
      </motion.div>
    </>
  );
}
