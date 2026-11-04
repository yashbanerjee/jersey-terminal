"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { lockScroll } from "@/components/motion/SmoothScroll";

type Phase = "boot" | "burst" | "open" | "done";

const STATUS = [
  "Igniting floodlights",
  "Syncing kit drops",
  "Charging neon rails",
  "Unlocking terminal",
  "Go live",
];

/**
 * Cinematic boot → neon burst → curtain open → dramatic site fly-in.
 */
export function BootSplash({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const sparks = useMemo(
    () =>
      Array.from({ length: 26 }).map((_, i) => ({
        id: i,
        left: `${4 + ((i * 13) % 92)}%`,
        delay: (i % 10) * 0.14,
        duration: 2.1 + (i % 6) * 0.28,
        size: 2 + (i % 4),
        color: i % 3 === 0 ? "#b4ff1a" : i % 3 === 1 ? "#ff7a1a" : "#2ee6ff",
      })),
    [],
  );

  const shards = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => ({
        id: i,
        x: (i % 2 === 0 ? -1 : 1) * (36 + (i % 6) * 26),
        y: -24 - (i % 7) * 20,
        rot: (i % 2 === 0 ? -1 : 1) * (18 + i * 9),
        color: i % 2 === 0 ? "#b4ff1a" : "#ff7a1a",
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
    const minMs = 2600;

    lockScroll(true);

    const statusTimer = window.setInterval(() => {
      setStatusIdx((i) => Math.min(STATUS.length - 1, i + 1));
    }, 480);

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - started) / minMs);
      const eased = 1 - Math.pow(1 - t, 2.8);
      setProgress(Math.min(0.96, eased * 0.96));
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

      setPhase("burst");
      await new Promise((r) => setTimeout(r, 480));
      if (cancelled) return;

      setPhase("open");
      window.dispatchEvent(new CustomEvent("jt:booted"));

      await new Promise((r) => setTimeout(r, 1200));
      if (cancelled) return;
      setPhase("done");
      lockScroll(false);
    }

    void finish();

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      window.clearInterval(statusTimer);
      lockScroll(false);
    };
  }, [reduce]);

  const showOverlay = phase === "boot" || phase === "burst" || phase === "open";
  const contentLive = phase === "open" || phase === "done";
  const pct = Math.round(progress * 100);

  return (
    <>
      <AnimatePresence>
        {showOverlay && (
          <motion.div
            key="jt-boot-root"
            className="pointer-events-none fixed inset-0 z-[200] overflow-hidden"
            aria-busy={phase === "boot"}
            aria-live="polite"
          >
            {/* Left door */}
            <motion.div
              className="absolute inset-y-0 left-0 w-[51%] overflow-hidden bg-jt-black"
              initial={{ x: 0 }}
              animate={phase === "open" ? { x: "-102%" } : { x: 0 }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <DoorPlate side="left" />
            </motion.div>

            {/* Right door */}
            <motion.div
              className="absolute inset-y-0 right-0 w-[51%] overflow-hidden bg-jt-black"
              initial={{ x: 0 }}
              animate={phase === "open" ? { x: "102%" } : { x: 0 }}
              transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
            >
              <DoorPlate side="right" />
            </motion.div>

            {/* Center stage (logo + HUD) */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={
                phase === "open"
                  ? { opacity: 0, scale: 1.4, filter: "blur(22px)", y: -30 }
                  : phase === "burst"
                    ? { opacity: 1, scale: 1.1, filter: "blur(0px)", y: 0 }
                    : { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }
              }
              transition={{ duration: phase === "open" ? 0.6 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-none absolute inset-0">
                <div
                  className="absolute inset-0 scale-110 bg-cover bg-center opacity-45"
                  style={{ backgroundImage: "url(/bg/stadium-night.jpg)" }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(5,6,7,0.1),rgba(5,6,7,0.95)_74%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(180,255,26,0.22),transparent_36%),radial-gradient(circle_at_78%_55%,rgba(255,122,26,0.26),transparent_40%),radial-gradient(circle_at_22%_68%,rgba(46,230,255,0.16),transparent_38%)]" />

                <motion.span
                  className="absolute left-[-30%] top-[24%] h-[3px] w-[160%] -rotate-[20deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.95),transparent)] blur-[1px]"
                  animate={{ x: ["-12%", "12%", "-12%"], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute left-[-30%] top-[66%] h-[5px] w-[160%] -rotate-[20deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,1),transparent)] blur-[1.5px]"
                  animate={{ x: ["10%", "-14%", "10%"], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />

                {sparks.map((s) => (
                  <motion.span
                    key={s.id}
                    className="absolute bottom-[-4%] rounded-full"
                    style={{
                      left: s.left,
                      width: s.size,
                      height: s.size * 3.4,
                      background: s.color,
                      boxShadow: `0 0 14px ${s.color}`,
                    }}
                    animate={{ y: ["0vh", "-120vh"], opacity: [0, 1, 0] }}
                    transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}
                  />
                ))}

                <motion.div
                  className="absolute inset-x-0 h-32 bg-[linear-gradient(180deg,transparent,rgba(180,255,26,0.12),transparent)]"
                  animate={{ top: ["-18%", "118%"] }}
                  transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-6">
                <div className="relative mb-8 grid place-items-center sm:mb-9">
                  <motion.span
                    className="absolute h-[10.5rem] w-[10.5rem] rounded-full sm:h-[12.5rem] sm:w-[12.5rem]"
                    style={{
                      background:
                        "conic-gradient(from 0deg, rgba(180,255,26,1), rgba(46,230,255,0.55), rgba(255,122,26,1), rgba(255,176,32,0.8), rgba(180,255,26,1))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.9, repeat: Infinity, ease: "linear" }}
                  />
                  <motion.span
                    className="absolute h-[12.5rem] w-[12.5rem] rounded-full border border-white/15 sm:h-[14.5rem] sm:w-[14.5rem]"
                    animate={{ rotate: -360, scale: [1, 1.07, 1] }}
                    transition={{
                      rotate: { duration: 5.5, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1.6, repeat: Infinity, ease: "easeInOut" },
                    }}
                  />
                  <motion.span
                    className="absolute h-48 w-48 rounded-full bg-[radial-gradient(circle,rgba(180,255,26,0.45),transparent_65%)] blur-2xl sm:h-56 sm:w-56"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.78, 1.22, 0.78] }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.35, opacity: 0, rotate: -28, y: 50 }}
                    animate={
                      phase === "burst"
                        ? { scale: 1.22, opacity: 1, rotate: 0, y: 0 }
                        : { scale: 1, opacity: 1, rotate: 0, y: 0 }
                    }
                    transition={{ type: "spring", stiffness: 170, damping: 11, mass: 0.6 }}
                  >
                    <motion.div
                      className="jt-chamfer relative bg-[linear-gradient(135deg,rgba(46,230,255,1),rgba(255,255,255,0.45)_35%,rgba(255,122,26,1))] p-[2px] shadow-[0_0_80px_-4px_rgba(180,255,26,0.9)]"
                      animate={{ y: phase === "boot" ? [0, -10, 0] : 0 }}
                      transition={{ duration: 2, repeat: phase === "boot" ? Infinity : 0, ease: "easeInOut" }}
                    >
                      <div className="jt-chamfer grid h-28 w-28 place-items-center bg-jt-black sm:h-32 sm:w-32">
                        <Image
                          src="/brand/jt-mark.png"
                          alt="Jersey Terminal"
                          width={96}
                          height={96}
                          priority
                          className="h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_30px_rgba(180,255,26,0.8)] sm:h-24 sm:w-24"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {phase === "burst" &&
                      shards.map((s) => (
                        <motion.span
                          key={s.id}
                          className="absolute left-1/2 top-1/2 h-1 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{ background: s.color, boxShadow: `0 0 16px ${s.color}` }}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                          animate={{ opacity: 0, x: s.x, y: s.y, scale: 0.3, rotate: s.rot }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))}
                  </AnimatePresence>
                </div>

                <motion.div
                  className="mb-8 text-center sm:mb-9"
                  initial={{ opacity: 0, y: 28, filter: "blur(12px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="jt-display text-[clamp(2rem,6vw,3.25rem)] leading-none tracking-wide">
                    <span className="jt-gradient-text-steel">Jersey</span>{" "}
                    <span className="jt-gradient-text-fire">Terminal</span>
                  </p>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phase === "burst" ? "live" : STATUS[statusIdx]}
                      initial={{ opacity: 0, y: 12, scale: 0.94 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.26 }}
                      className="mt-3 text-[11px] uppercase tracking-[0.38em] text-jt-muted"
                    >
                      {phase === "burst" ? (
                        <span className="jt-gradient-text-aurora">We&apos;re live — enter</span>
                      ) : (
                        STATUS[statusIdx]
                      )}
                    </motion.p>
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="w-full max-w-xs"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: phase === "burst" ? 0 : 1, y: phase === "burst" ? -12 : 0 }}
                  transition={{ delay: 0.22, duration: 0.4 }}
                >
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[10px] uppercase tracking-[0.28em] text-white/45">Boot sequence</span>
                    <span className="jt-display text-2xl leading-none">
                      <span className="jt-gradient-text-aurora">{String(pct).padStart(2, "0")}</span>
                      <span className="text-white/35">%</span>
                    </span>
                  </div>
                  <div className="relative h-2.5 overflow-hidden rounded-full bg-white/[0.08] ring-1 ring-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#b4ff1a,#2ee6ff_40%,#ff7a1a)] shadow-[0_0_28px_rgba(180,255,26,0.7)]"
                      style={{ width: `${pct}%` }}
                    />
                    <motion.span
                      className="absolute inset-y-0 w-24 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.7),transparent)]"
                      animate={{ left: ["-30%", "130%"] }}
                      transition={{ duration: 1.05, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {["PWR", "KIT", "NET", "GO"].map((label, i) => {
                      const on = pct >= (i + 1) * 24;
                      return (
                        <div
                          key={label}
                          className={`rounded-sm border px-1 py-1.5 text-center text-[8px] uppercase tracking-[0.18em] transition-all duration-300 ${
                            on
                              ? "border-jt-neon/60 bg-jt-neon/20 text-jt-neon shadow-[0_0_16px_-4px_rgba(180,255,26,0.8)]"
                              : "border-white/10 text-white/25"
                          }`}
                        >
                          {label}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              <span className="absolute left-5 top-5 h-12 w-12 border-l-2 border-t-2 border-jt-neon/70 sm:left-8 sm:top-8" />
              <span className="absolute right-5 top-5 h-12 w-12 border-r-2 border-t-2 border-jt-orange/70 sm:right-8 sm:top-8" />
              <span className="absolute bottom-5 left-5 h-12 w-12 border-b-2 border-l-2 border-jt-cyan/55 sm:bottom-8 sm:left-8" />
              <span className="absolute bottom-5 right-5 h-12 w-12 border-b-2 border-r-2 border-jt-neon/55 sm:bottom-8 sm:right-8" />
            </motion.div>

            <AnimatePresence>
              {phase === "open" && (
                <motion.span
                  className="absolute inset-y-0 left-1/2 z-[5] w-[2px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(180,255,26,1),rgba(255,122,26,1),transparent)] shadow-[0_0_50px_16px_rgba(180,255,26,0.65)]"
                  initial={{ opacity: 1, scaleY: 0.15 }}
                  animate={{ opacity: 0, scaleY: 1.35 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === "burst" && (
                <motion.div
                  className="absolute inset-0 z-[6] bg-[radial-gradient(circle,rgba(255,255,255,0.35),rgba(180,255,26,0.25)_28%,rgba(255,122,26,0.12)_48%,transparent_70%)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.2, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="flex min-h-full w-full flex-1 flex-col"
        initial={
          reduce
            ? false
            : {
                opacity: 0,
                y: 120,
                scale: 0.88,
                filter: "blur(28px)",
                rotateX: 12,
              }
        }
        animate={
          contentLive || reduce
            ? {
                opacity: 1,
                y: 0,
                scale: 1,
                filter: "blur(0px)",
                rotateX: 0,
              }
            : {
                opacity: 0,
                y: 120,
                scale: 0.88,
                filter: "blur(28px)",
                rotateX: 12,
              }
        }
        transition={{
          duration: 1.15,
          ease: [0.16, 1, 0.3, 1],
          delay: phase === "open" ? 0.12 : 0,
        }}
        style={{ transformOrigin: "50% 8%", transformPerspective: 1600 }}
      >
        {children}
      </motion.div>
    </>
  );
}

function DoorPlate({ side }: { side: "left" | "right" }) {
  return (
    <div className="absolute inset-0">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{
          backgroundImage: "url(/bg/stadium-night.jpg)",
          backgroundPosition: side === "left" ? "left center" : "right center",
        }}
      />
      <div className="absolute inset-0 bg-jt-black/85" />
      <div
        className={`absolute inset-y-0 w-24 ${
          side === "left"
            ? "right-0 bg-gradient-to-l from-jt-neon/20 to-transparent"
            : "left-0 bg-gradient-to-r from-jt-orange/20 to-transparent"
        }`}
      />
    </div>
  );
}
