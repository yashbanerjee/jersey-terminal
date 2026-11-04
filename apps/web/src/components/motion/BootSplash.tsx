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

const ORBIT_DOTS = [
  { angle: 0, color: "#b4ff1a", r: 78, dur: 3.2 },
  { angle: 90, color: "#2ee6ff", r: 92, dur: 4.1 },
  { angle: 180, color: "#ff7a1a", r: 78, dur: 3.6 },
  { angle: 270, color: "#ffb020", r: 92, dur: 4.8 },
  { angle: 45, color: "#b4ff1a", r: 108, dur: 5.2 },
  { angle: 225, color: "#2ee6ff", r: 108, dur: 5.6 },
];

/**
 * Cinematic boot splash — denser HUD energy, then curtain open + site fly-in.
 */
export function BootSplash({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("boot");
  const [progress, setProgress] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);

  const sparks = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        id: i,
        left: `${3 + ((i * 11) % 94)}%`,
        delay: (i % 12) * 0.11,
        duration: 1.8 + (i % 7) * 0.25,
        size: 2 + (i % 4),
        color: i % 3 === 0 ? "#b4ff1a" : i % 3 === 1 ? "#ff7a1a" : "#2ee6ff",
      })),
    [],
  );

  const shards = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        x: (i % 2 === 0 ? -1 : 1) * (40 + (i % 6) * 30),
        y: -20 - (i % 8) * 22,
        rot: (i % 2 === 0 ? -1 : 1) * (22 + i * 10),
        color: i % 2 === 0 ? "#b4ff1a" : "#ff7a1a",
      })),
    [],
  );

  const eqBars = useMemo(() => Array.from({ length: 18 }).map((_, i) => i), []);

  useEffect(() => {
    if (reduce) {
      setPhase("done");
      return;
    }

    let cancelled = false;
    let raf = 0;
    const started = performance.now();
    const minMs = 2800;

    lockScroll(true);

    const statusTimer = window.setInterval(() => {
      setStatusIdx((i) => Math.min(STATUS.length - 1, i + 1));
    }, 500);

    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min(1, (now - started) / minMs);
      const eased = 1 - Math.pow(1 - t, 2.7);
      setProgress(Math.min(0.97, eased * 0.97));
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
      await new Promise((r) => setTimeout(r, 520));
      if (cancelled) return;

      setPhase("open");
      window.dispatchEvent(new CustomEvent("jt:booted"));

      await new Promise((r) => setTimeout(r, 1150));
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
  const ring = Math.min(1, progress);

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
            <motion.div
              className="absolute inset-y-0 left-0 w-[51%] overflow-hidden bg-jt-black"
              initial={{ x: 0 }}
              animate={phase === "open" ? { x: "-102%" } : { x: 0 }}
              transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
            >
              <DoorPlate side="left" />
            </motion.div>
            <motion.div
              className="absolute inset-y-0 right-0 w-[51%] overflow-hidden bg-jt-black"
              initial={{ x: 0 }}
              animate={phase === "open" ? { x: "102%" } : { x: 0 }}
              transition={{ duration: 1.15, ease: [0.76, 0, 0.24, 1] }}
            >
              <DoorPlate side="right" />
            </motion.div>

            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={
                phase === "open"
                  ? { opacity: 0, scale: 1.45, filter: "blur(24px)", y: -36 }
                  : phase === "burst"
                    ? { opacity: 1, scale: 1.08, filter: "blur(0px)", y: 0 }
                    : { opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }
              }
              transition={{ duration: phase === "open" ? 0.65 : 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Atmosphere */}
              <div className="pointer-events-none absolute inset-0">
                <motion.div
                  className="absolute inset-[-8%] bg-cover bg-center opacity-50"
                  style={{ backgroundImage: "url(/bg/stadium-night.jpg)" }}
                  animate={{ scale: [1.05, 1.14, 1.05], x: ["0%", "-1.5%", "0%"] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,rgba(5,6,7,0.05),rgba(5,6,7,0.92)_70%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(180,255,26,0.22),transparent_34%),radial-gradient(circle_at_80%_40%,rgba(255,122,26,0.28),transparent_42%),radial-gradient(circle_at_18%_60%,rgba(46,230,255,0.2),transparent_40%)]" />

                {/* Hex mesh */}
                <div
                  className="absolute inset-0 opacity-[0.14]"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(180,255,26,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(46,230,255,0.25) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                    maskImage: "radial-gradient(circle at 50% 45%, #000 20%, transparent 70%)",
                    WebkitMaskImage: "radial-gradient(circle at 50% 45%, #000 20%, transparent 70%)",
                  }}
                />

                {/* Radar sweep */}
                <motion.div
                  className="absolute left-1/2 top-[42%] h-[55vmin] w-[55vmin] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
                  style={{
                    background:
                      "conic-gradient(from 0deg, transparent 0deg, rgba(180,255,26,0.0) 40deg, rgba(180,255,26,0.35) 70deg, transparent 95deg)",
                  }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3.2, repeat: Infinity, ease: "linear" }}
                />

                <motion.span
                  className="absolute left-[-30%] top-[22%] h-[3px] w-[160%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,1),transparent)] blur-[1px]"
                  animate={{ x: ["-14%", "14%", "-14%"], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute left-[-30%] top-[48%] h-[2px] w-[160%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(180,255,26,0.8),transparent)]"
                  animate={{ x: ["10%", "-16%", "10%"], opacity: [0.2, 0.85, 0.2] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.span
                  className="absolute left-[-30%] top-[68%] h-[5px] w-[160%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,1),transparent)] blur-[1.5px]"
                  animate={{ x: ["12%", "-12%", "12%"], opacity: [0.35, 1, 0.35] }}
                  transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
                />

                {sparks.map((s) => (
                  <motion.span
                    key={s.id}
                    className="absolute bottom-[-4%] rounded-full"
                    style={{
                      left: s.left,
                      width: s.size,
                      height: s.size * 3.6,
                      background: s.color,
                      boxShadow: `0 0 14px ${s.color}`,
                    }}
                    animate={{ y: ["0vh", "-125vh"], opacity: [0, 1, 0], rotate: [0, 20] }}
                    transition={{ duration: s.duration, delay: s.delay, repeat: Infinity, ease: "linear" }}
                  />
                ))}

                <motion.div
                  className="absolute inset-x-0 h-36 bg-[linear-gradient(180deg,transparent,rgba(180,255,26,0.14),transparent)]"
                  animate={{ top: ["-20%", "120%"] }}
                  transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
                />
              </div>

              <div className="relative z-10 flex w-full max-w-xl flex-col items-center px-6">
                {/* Logo + circular progress */}
                <div className="relative mb-7 grid place-items-center sm:mb-8">
                  {/* Circular progress track */}
                  <svg
                    className="absolute h-[13.5rem] w-[13.5rem] -rotate-90 sm:h-[15.5rem] sm:w-[15.5rem]"
                    viewBox="0 0 120 120"
                    aria-hidden
                  >
                    <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" />
                    <motion.circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#jtBootGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeDasharray={2 * Math.PI * 54}
                      animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - ring) }}
                      transition={{ type: "spring", stiffness: 80, damping: 20 }}
                      style={{ filter: "drop-shadow(0 0 8px rgba(180,255,26,0.8))" }}
                    />
                    <defs>
                      <linearGradient id="jtBootGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#b4ff1a" />
                        <stop offset="45%" stopColor="#2ee6ff" />
                        <stop offset="100%" stopColor="#ff7a1a" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <motion.span
                    className="absolute h-[11rem] w-[11rem] rounded-full sm:h-[12.5rem] sm:w-[12.5rem]"
                    style={{
                      background:
                        "conic-gradient(from 0deg, rgba(180,255,26,1), rgba(46,230,255,0.5), rgba(255,122,26,1), rgba(255,176,32,0.75), rgba(180,255,26,1))",
                      mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))",
                      WebkitMask:
                        "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 1.5px))",
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.7, repeat: Infinity, ease: "linear" }}
                  />

                  {/* Orbiting micro-dots */}
                  {ORBIT_DOTS.map((d, i) => (
                    <motion.div
                      key={i}
                      className="pointer-events-none absolute left-1/2 top-1/2 h-0 w-0"
                      animate={{ rotate: 360 }}
                      transition={{ duration: d.dur, repeat: Infinity, ease: "linear" }}
                      style={{ rotate: d.angle }}
                    >
                      <span
                        className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                        style={{
                          background: d.color,
                          boxShadow: `0 0 12px ${d.color}`,
                          transform: `translate(-50%, -50%) translateY(-${d.r}px)`,
                        }}
                      />
                    </motion.div>
                  ))}

                  <motion.span
                    className="absolute h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(180,255,26,0.5),transparent_62%)] blur-2xl sm:h-60 sm:w-60"
                    animate={{ opacity: [0.35, 1, 0.35], scale: [0.75, 1.25, 0.75] }}
                    transition={{ duration: 1.25, repeat: Infinity, ease: "easeInOut" }}
                  />

                  <motion.div
                    className="relative z-10"
                    initial={{ scale: 0.3, opacity: 0, rotate: -30, y: 60 }}
                    animate={
                      phase === "burst"
                        ? { scale: 1.2, opacity: 1, rotate: 0, y: 0 }
                        : { scale: 1, opacity: 1, rotate: 0, y: 0 }
                    }
                    transition={{ type: "spring", stiffness: 180, damping: 11, mass: 0.55 }}
                  >
                    <motion.div
                      className="jt-chamfer relative bg-[linear-gradient(135deg,rgba(46,230,255,1),rgba(255,255,255,0.5)_32%,rgba(255,122,26,1))] p-[2.5px] shadow-[0_0_90px_-2px_rgba(180,255,26,0.95)]"
                      animate={{
                        y: phase === "boot" ? [0, -12, 0] : 0,
                        rotateY: phase === "boot" ? [-6, 6, -6] : 0,
                      }}
                      transition={{ duration: 2.2, repeat: phase === "boot" ? Infinity : 0, ease: "easeInOut" }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <div className="jt-chamfer relative grid h-28 w-28 place-items-center overflow-hidden bg-jt-black sm:h-32 sm:w-32">
                        <motion.span
                          aria-hidden
                          className="absolute inset-0 bg-[linear-gradient(120deg,transparent_30%,rgba(180,255,26,0.25),transparent_70%)]"
                          animate={{ x: ["-120%", "120%"] }}
                          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.4 }}
                        />
                        <Image
                          src="/brand/jt-mark.png"
                          alt="Jersey Terminal"
                          width={96}
                          height={96}
                          priority
                          className="relative z-10 h-[4.5rem] w-[4.5rem] object-contain drop-shadow-[0_0_32px_rgba(180,255,26,0.9)] sm:h-24 sm:w-24"
                        />
                      </div>
                    </motion.div>
                  </motion.div>

                  <AnimatePresence>
                    {phase === "burst" &&
                      shards.map((s) => (
                        <motion.span
                          key={s.id}
                          className="absolute left-1/2 top-1/2 h-1 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full"
                          style={{ background: s.color, boxShadow: `0 0 18px ${s.color}` }}
                          initial={{ opacity: 1, x: 0, y: 0, scale: 1, rotate: 0 }}
                          animate={{ opacity: 0, x: s.x, y: s.y, scale: 0.25, rotate: s.rot }}
                          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                        />
                      ))}
                  </AnimatePresence>

                  {/* Big % inside ring corner */}
                  <motion.div
                    className="absolute -bottom-1 right-[8%] jt-display text-sm sm:text-base"
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                  >
                    <span className="jt-gradient-text-aurora">{String(pct).padStart(2, "0")}</span>
                  </motion.div>
                </div>

                {/* Wordmark — letter cascade */}
                <motion.div
                  className="mb-6 text-center sm:mb-7"
                  initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: 0.1, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="jt-display flex flex-wrap items-baseline justify-center gap-x-[0.18em] text-[clamp(2.1rem,6.5vw,3.5rem)] leading-none tracking-wide">
                    {"JERSEY".split("").map((ch, i) => (
                      <motion.span
                        key={`j-${i}`}
                        className="jt-gradient-text-steel inline-block"
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + i * 0.04, type: "spring", stiffness: 220, damping: 16 }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                    <span className="w-2" />
                    {"TERMINAL".split("").map((ch, i) => (
                      <motion.span
                        key={`t-${i}`}
                        className="jt-gradient-text-fire inline-block"
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.35 + i * 0.04, type: "spring", stiffness: 220, damping: 16 }}
                      >
                        {ch}
                      </motion.span>
                    ))}
                  </p>

                  <div className="mt-3 flex items-center justify-center gap-2.5">
                    <span className="jt-pulse inline-block h-1.5 w-1.5 rounded-full bg-jt-neon shadow-[0_0_14px_rgba(180,255,26,1)]" />
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phase === "burst" ? "live" : STATUS[statusIdx]}
                        initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                        exit={{ opacity: 0, y: -12, filter: "blur(4px)" }}
                        transition={{ duration: 0.28 }}
                        className="text-[11px] uppercase tracking-[0.4em] text-jt-muted"
                      >
                        {phase === "burst" ? (
                          <span className="jt-gradient-text-aurora">We&apos;re live — enter</span>
                        ) : (
                          STATUS[statusIdx]
                        )}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </motion.div>

                {/* Equalizer */}
                <div className="mb-6 flex h-8 items-end justify-center gap-[3px] sm:mb-7">
                  {eqBars.map((i) => (
                    <motion.span
                      key={i}
                      className="w-[3px] rounded-full sm:w-1"
                      style={{
                        background:
                          i % 3 === 0 ? "#b4ff1a" : i % 3 === 1 ? "#2ee6ff" : "#ff7a1a",
                        boxShadow: `0 0 8px ${i % 3 === 0 ? "#b4ff1a" : i % 3 === 1 ? "#2ee6ff" : "#ff7a1a"}`,
                      }}
                      animate={{ height: ["18%", `${35 + ((i * 17) % 65)}%`, "22%", `${40 + ((i * 23) % 60)}%`, "18%"] }}
                      transition={{ duration: 0.9 + (i % 5) * 0.12, repeat: Infinity, ease: "easeInOut", delay: i * 0.04 }}
                    />
                  ))}
                </div>

                {/* Progress HUD */}
                <motion.div
                  className="w-full max-w-sm"
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: phase === "burst" ? 0 : 1, y: phase === "burst" ? -14 : 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <div className="mb-2 flex items-end justify-between">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-white/50">Boot sequence</span>
                    <span className="jt-display text-2xl leading-none sm:text-3xl">
                      <span className="jt-gradient-text-aurora">{String(pct).padStart(2, "0")}</span>
                      <span className="text-white/30">%</span>
                    </span>
                  </div>
                  <div className="relative h-3 overflow-hidden rounded-full bg-white/[0.07] ring-1 ring-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,#b4ff1a,#2ee6ff_38%,#ff7a1a)] shadow-[0_0_32px_rgba(180,255,26,0.75)]"
                      style={{ width: `${pct}%` }}
                    />
                    <motion.span
                      className="absolute inset-y-0 w-28 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.75),transparent)]"
                      animate={{ left: ["-35%", "135%"] }}
                      transition={{ duration: 0.95, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-1.5">
                    {["PWR", "KIT", "NET", "GO"].map((label, i) => {
                      const on = pct >= (i + 1) * 24;
                      return (
                        <motion.div
                          key={label}
                          animate={on ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                          transition={{ duration: 0.45 }}
                          className={`rounded-sm border px-1 py-1.5 text-center text-[8px] uppercase tracking-[0.18em] transition-all duration-300 ${
                            on
                              ? "border-jt-neon/70 bg-jt-neon/20 text-jt-neon shadow-[0_0_20px_-2px_rgba(180,255,26,0.9)]"
                              : "border-white/10 text-white/25"
                          }`}
                        >
                          {label}
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              </div>

              {/* Corner HUD + ticking coords */}
              <span className="absolute left-5 top-5 h-12 w-12 border-l-2 border-t-2 border-jt-neon/80 sm:left-8 sm:top-8" />
              <span className="absolute right-5 top-5 h-12 w-12 border-r-2 border-t-2 border-jt-orange/80 sm:right-8 sm:top-8" />
              <span className="absolute bottom-5 left-5 h-12 w-12 border-b-2 border-l-2 border-jt-cyan/60 sm:bottom-8 sm:left-8" />
              <span className="absolute bottom-5 right-5 h-12 w-12 border-b-2 border-r-2 border-jt-neon/60 sm:bottom-8 sm:right-8" />
              <p className="absolute left-8 top-8 hidden text-[9px] uppercase tracking-[0.28em] text-jt-neon/70 sm:block">
                JT // SECURE
              </p>
              <p className="absolute right-8 bottom-8 hidden text-[9px] uppercase tracking-[0.28em] text-jt-orange/70 sm:block">
                UAE · WORLD
              </p>
            </motion.div>

            <AnimatePresence>
              {phase === "open" && (
                <motion.span
                  className="absolute inset-y-0 left-1/2 z-[5] w-[3px] -translate-x-1/2 bg-[linear-gradient(180deg,transparent,rgba(180,255,26,1),rgba(255,122,26,1),transparent)] shadow-[0_0_60px_20px_rgba(180,255,26,0.7)]"
                  initial={{ opacity: 1, scaleY: 0.12 }}
                  animate={{ opacity: 0, scaleY: 1.4 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {phase === "burst" && (
                <motion.div
                  className="absolute inset-0 z-[6] bg-[radial-gradient(circle,rgba(255,255,255,0.45),rgba(180,255,26,0.3)_26%,rgba(255,122,26,0.14)_46%,transparent_70%)]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0.15, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55 }}
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
            : { opacity: 0, y: 130, scale: 0.86, filter: "blur(30px)", rotateX: 14 }
        }
        animate={
          contentLive || reduce
            ? { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", rotateX: 0 }
            : { opacity: 0, y: 130, scale: 0.86, filter: "blur(30px)", rotateX: 14 }
        }
        transition={{
          duration: 1.2,
          ease: [0.16, 1, 0.3, 1],
          delay: phase === "open" ? 0.1 : 0,
        }}
        style={{ transformOrigin: "50% 6%", transformPerspective: 1800 }}
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
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url(/bg/stadium-night.jpg)",
          backgroundPosition: side === "left" ? "left center" : "right center",
        }}
      />
      <div className="absolute inset-0 bg-jt-black/88" />
      <div
        className={`absolute inset-y-0 w-28 ${
          side === "left"
            ? "right-0 bg-gradient-to-l from-jt-neon/25 to-transparent"
            : "left-0 bg-gradient-to-r from-jt-orange/25 to-transparent"
        }`}
      />
    </div>
  );
}
