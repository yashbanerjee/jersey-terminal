"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealEffect = "up" | "down" | "left" | "right" | "scale" | "3d" | "blur";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  /** Distance in px the element travels in from (for directional effects). */
  y?: number;
  x?: number;
  once?: boolean;
  effect?: RevealEffect;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function initialFor(effect: RevealEffect, y: number, x: number, reduce: boolean | null) {
  if (reduce) return false;
  switch (effect) {
    case "left":
      return { opacity: 0, x: -Math.abs(x || 40) };
    case "right":
      return { opacity: 0, x: Math.abs(x || 40) };
    case "down":
      return { opacity: 0, y: -Math.abs(y) };
    case "scale":
      return { opacity: 0, scale: 0.92 };
    case "blur":
      return { opacity: 0, y: y * 0.5, filter: "blur(12px)" };
    case "3d":
      return { opacity: 0, y: y * 0.7, rotateX: 12, rotateY: -8, scale: 0.94 };
    case "up":
    default:
      return { opacity: 0, y };
  }
}

function visibleFor(effect: RevealEffect) {
  switch (effect) {
    case "left":
    case "right":
      return { opacity: 1, x: 0 };
    case "scale":
      return { opacity: 1, scale: 1 };
    case "blur":
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    case "3d":
      return { opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 };
    case "down":
    case "up":
    default:
      return { opacity: 1, y: 0 };
  }
}

/** Fade / slide / 3D rise into view when scrolled to. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 28,
  x = 40,
  once = true,
  effect = "up",
}: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={initialFor(effect, y, x, reduce)}
      whileInView={visibleFor(effect)}
      /* amount + bottom margin so Lenis/smooth-scroll still fires when the block enters */
      viewport={{ once, amount: 0.25, margin: "0px 0px -12% 0px" }}
      transition={{ duration: effect === "3d" ? 0.9 : 0.75, delay, ease: EASE }}
      style={effect === "3d" ? { transformPerspective: 900, transformStyle: "preserve-3d" } : undefined}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 32, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: EASE } },
};

const item3d: Variants = {
  hidden: { opacity: 0, y: 40, rotateY: -14, rotateX: 8, scale: 0.92 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.75, ease: EASE },
  },
};

/** Grid/list wrapper that staggers its direct children into view. */
export function StaggerGroup({
  children,
  className,
  effect = "up",
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -10% 0px" }}
      style={effect === "3d" ? { perspective: 1200 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  effect = "up",
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
}) {
  return (
    <motion.div
      className={className}
      variants={effect === "3d" ? item3d : itemUp}
      style={effect === "3d" ? { transformStyle: "preserve-3d" } : undefined}
      whileHover={
        effect === "3d"
          ? { y: -8, rotateY: 4, transition: { type: "spring", stiffness: 260, damping: 20 } }
          : { y: -4 }
      }
    >
      {children}
    </motion.div>
  );
}
