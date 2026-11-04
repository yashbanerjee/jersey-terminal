"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { AnimatedGradientBg } from "@/components/motion/AnimatedGradientBg";
import { RisingDots } from "@/components/motion/RisingDots";
import { isMobilePerfTarget } from "@/lib/perf";

/**
 * Site-wide stadium photo backdrop + dual cursor glow (lime + orange trail).
 * Phones get backdrop only — no particle rain or cursor compositing layers.
 */
export function PageAtmosphere() {
  const [desktopFx, setDesktopFx] = useState(false);
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const x = useSpring(mx, { stiffness: 70, damping: 18, mass: 0.55 });
  const y = useSpring(my, { stiffness: 70, damping: 18, mass: 0.55 });
  const tx = useSpring(mx, { stiffness: 28, damping: 18, mass: 0.9 });
  const ty = useSpring(my, { stiffness: 28, damping: 18, mass: 0.9 });

  useEffect(() => {
    if (isMobilePerfTarget()) return;
    setDesktopFx(true);
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    const onMove = (e: PointerEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [mx, my]);

  const spotlight = useMotionTemplate`radial-gradient(420px circle at ${x}px ${y}px, rgba(180,255,26,0.14), transparent 62%)`;
  const trail = useMotionTemplate`radial-gradient(560px circle at ${tx}px ${ty}px, rgba(255,122,26,0.12), rgba(46,230,255,0.06) 45%, transparent 70%)`;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <AnimatedGradientBg intensity="full" />
      {desktopFx && (
        <>
          <RisingDots />
          <motion.div aria-hidden className="absolute inset-0 mix-blend-screen" style={{ background: trail }} />
          <motion.div aria-hidden className="absolute inset-0" style={{ background: spotlight }} />
        </>
      )}
    </div>
  );
}
