"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";

export type RevealEffect = "up" | "down" | "left" | "right" | "scale" | "3d" | "blur" | "pop" | "clip";

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
      return { opacity: 0, x: -Math.abs(x || 48) };
    case "right":
      return { opacity: 0, x: Math.abs(x || 48) };
    case "down":
      return { opacity: 0, y: -Math.abs(y) };
    case "scale":
      return { opacity: 0, scale: 0.88 };
    case "blur":
      return { opacity: 0, y: y * 0.55, filter: "blur(14px)" };
    case "3d":
      return { opacity: 0, y: y * 0.75, rotateX: 14, rotateY: -10, scale: 0.92 };
    case "pop":
      return { opacity: 0, scale: 0.72, y: 18 };
    case "clip":
      return { opacity: 0, y: 40, clipPath: "inset(12% 0 88% 0)" };
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
    case "pop":
      return { opacity: 1, scale: 1, y: 0 };
    case "blur":
      return { opacity: 1, y: 0, filter: "blur(0px)" };
    case "3d":
      return { opacity: 1, y: 0, rotateX: 0, rotateY: 0, scale: 1 };
    case "clip":
      return { opacity: 1, y: 0, clipPath: "inset(0% 0 0% 0)" };
    case "down":
    case "up":
    default:
      return { opacity: 1, y: 0 };
  }
}

function durationFor(effect: RevealEffect) {
  if (effect === "3d" || effect === "clip") return 0.95;
  if (effect === "pop") return 0.55;
  if (effect === "blur") return 0.85;
  return 0.75;
}

/** Fade / slide / 3D rise into view when scrolled to. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 36,
  x = 48,
  once = true,
  effect = "up",
}: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={initialFor(effect, y, x, reduce)}
      whileInView={visibleFor(effect)}
      viewport={{ once, amount: 0.22, margin: "0px 0px -10% 0px" }}
      transition={{
        duration: durationFor(effect),
        delay,
        ease: effect === "pop" ? [0.34, 1.4, 0.64, 1] : EASE,
      }}
      style={effect === "3d" ? { transformPerspective: 900, transformStyle: "preserve-3d" } : undefined}
    >
      {children}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 36, scale: 0.97 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, ease: EASE } },
};

const item3d: Variants = {
  hidden: { opacity: 0, y: 48, rotateY: -16, rotateX: 10, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.8, ease: EASE },
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
      viewport={{ once: true, amount: 0.18, margin: "0px 0px -8% 0px" }}
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
      whileHover={{
        y: effect === "3d" ? -10 : -6,
        rotateY: effect === "3d" ? 5 : 0,
        transition: { type: "spring", stiffness: 280, damping: 18 },
      }}
    >
      {children}
    </motion.div>
  );
}
