"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { AnimatedGradientBg } from "@/components/motion/AnimatedGradientBg";

/**
 * Site-wide neon atmosphere (the hero layers a stronger version on top).
 * Includes a soft spotlight that follows the cursor on pointer devices.
 */
export function PageAtmosphere() {
  const mx = useMotionValue(-1000);
  const my = useMotionValue(-1000);
  const x = useSpring(mx, { stiffness: 60, damping: 20, mass: 0.6 });
  const y = useSpring(my, { stiffness: 60, damping: 20, mass: 0.6 });

  useEffect(() => {
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

  const spotlight = useMotionTemplate`radial-gradient(520px circle at ${x}px ${y}px, rgba(255,122,26,0.11), rgba(46,230,255,0.05) 40%, transparent 70%)`;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <AnimatedGradientBg intensity="subtle" />
      {/* Gentle readability wash — much lighter than before so colour shows through */}
      <div className="absolute inset-0 bg-jt-black/15" />
      <motion.div aria-hidden className="absolute inset-0" style={{ background: spotlight }} />
    </div>
  );
}
