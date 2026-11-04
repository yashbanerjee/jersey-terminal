"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef, type ReactNode } from "react";

type IdleKind = "float" | "sway" | "pulse" | "breathe";

type Props = {
  children: ReactNode;
  className?: string;
  /** Continuous motion while the block stays on screen. */
  kind?: IdleKind;
  delay?: number;
  /** Stagger offset so neighbors don’t sync perfectly. */
  phase?: number;
};

const LOOPS: Record<
  IdleKind,
  { animate: Record<string, number[]>; duration: number }
> = {
  float: {
    animate: { y: [0, -10, 0] },
    duration: 3.8,
  },
  sway: {
    animate: { y: [0, -8, 0], rotateZ: [-1.2, 1.2, -1.2] },
    duration: 4.6,
  },
  pulse: {
    animate: { scale: [1, 1.03, 1] },
    duration: 2.8,
  },
  breathe: {
    animate: { y: [0, -6, 0], scale: [1, 1.015, 1] },
    duration: 5.2,
  },
};

/**
 * Keeps a soft loop running only while the element is in the viewport —
 * so sections feel alive after the scroll entrance finishes.
 */
export function IdleMotion({
  children,
  className,
  kind = "float",
  delay = 0,
  phase = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.15, margin: "80px 0px" });
  const reduce = useReducedMotion();
  const loop = LOOPS[kind];

  return (
    <motion.div
      ref={ref}
      className={className}
      animate={
        reduce || !inView
          ? { y: 0, rotateZ: 0, scale: 1 }
          : loop.animate
      }
      transition={
        reduce || !inView
          ? { duration: 0.35 }
          : {
              duration: loop.duration + phase * 0.35,
              delay,
              repeat: Infinity,
              ease: "easeInOut",
            }
      }
    >
      {children}
    </motion.div>
  );
}
