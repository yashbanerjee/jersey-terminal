"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import { useEffect } from "react";
import { AnimatedGradientBg } from "@/components/motion/AnimatedGradientBg";
import { RisingDots } from "@/components/motion/RisingDots";

/**
 * Site-wide stadium photo backdrop + soft lime cursor spotlight.
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

  const spotlight = useMotionTemplate`radial-gradient(480px circle at ${x}px ${y}px, rgba(180,255,26,0.1), transparent 65%)`;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <AnimatedGradientBg intensity="full" />
      <RisingDots />
      <motion.div aria-hidden className="absolute inset-0" style={{ background: spotlight }} />
    </div>
  );
}
