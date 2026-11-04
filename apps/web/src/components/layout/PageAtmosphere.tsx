"use client";

import { AnimatedGradientBg } from "@/components/motion/AnimatedGradientBg";

/**
 * Lightweight stadium backdrop only.
 * Cursor glow / particle rain were re-painting the full viewport on every frame.
 */
export function PageAtmosphere() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <AnimatedGradientBg intensity="subtle" />
    </div>
  );
}
