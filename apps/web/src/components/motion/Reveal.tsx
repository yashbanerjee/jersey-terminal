"use client";

import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useRef, type ReactNode } from "react";
import { IdleMotion } from "@/components/motion/IdleMotion";

export type RevealEffect = "up" | "down" | "left" | "right" | "scale" | "3d" | "blur" | "pop" | "clip";
export type RevealIdle = false | "float" | "sway" | "pulse" | "breathe";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  /** Re-play the entrance each time it scrolls into view. */
  once?: boolean;
  effect?: RevealEffect;
  /** Soft loop that keeps running while the block stays on screen. */
  idle?: RevealIdle;
};

const EASE = [0.22, 1, 0.36, 1] as const;

function initialFor(effect: RevealEffect, y: number, x: number, reduce: boolean | null) {
  if (reduce) return false;
  switch (effect) {
    case "left":
      return { opacity: 0, x: -Math.abs(x || 56) };
    case "right":
      return { opacity: 0, x: Math.abs(x || 56) };
    case "down":
      return { opacity: 0, y: -Math.abs(y) };
    case "scale":
      return { opacity: 0, scale: 0.86 };
    case "blur":
      return { opacity: 0, y: y * 0.4 };
    case "3d":
      return { opacity: 0, y: y * 0.5, scale: 0.96 };
    case "pop":
      return { opacity: 0, scale: 0.68, y: 22 };
    case "clip":
      return { opacity: 0, y: 48, clipPath: "inset(14% 0 86% 0)" };
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
      return { opacity: 1, y: 0 };
    case "3d":
      return { opacity: 1, y: 0, scale: 1 };
    case "clip":
      return { opacity: 1, y: 0, clipPath: "inset(0% 0 0% 0)" };
    case "down":
    case "up":
    default:
      return { opacity: 1, y: 0 };
  }
}

function durationFor(effect: RevealEffect) {
  if (effect === "3d" || effect === "clip") return 1;
  if (effect === "pop") return 0.55;
  if (effect === "blur") return 0.9;
  return 0.8;
}

/** Scroll entrance — then optional idle motion while it stays on screen. */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 44,
  x = 56,
  once = false,
  effect = "up",
  idle = false,
}: Props) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2, margin: "0px 0px -8% 0px" });

  const body = idle && !reduce ? (
    <IdleMotion kind={idle} delay={0.35 + delay} phase={delay * 3}>
      {children}
    </IdleMotion>
  ) : (
    children
  );

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={initialFor(effect, y, x, reduce)}
      whileInView={visibleFor(effect)}
      viewport={{ once, amount: 0.2, margin: "0px 0px -8% 0px" }}
      transition={{
        duration: durationFor(effect),
        delay,
        ease: effect === "pop" ? [0.34, 1.45, 0.64, 1] : EASE,
      }}
      style={effect === "3d" ? { transformPerspective: 1000, transformStyle: "preserve-3d" } : undefined}
      data-inview={inView ? "1" : "0"}
    >
      {body}
    </motion.div>
  );
}

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11, delayChildren: 0.1 } },
};

const itemUp: Variants = {
  hidden: { opacity: 0, y: 42, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.75, ease: EASE } },
};

const item3d: Variants = {
  hidden: { opacity: 0, y: 56, rotateY: -18, rotateX: 12, scale: 0.88 },
  show: {
    opacity: 1,
    y: 0,
    rotateY: 0,
    rotateX: 0,
    scale: 1,
    transition: { duration: 0.85, ease: EASE },
  },
};

/** Grid/list wrapper that staggers its direct children into view. */
export function StaggerGroup({
  children,
  className,
  effect = "up",
  once = false,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  once?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={container}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once, amount: 0.16, margin: "0px 0px -6% 0px" }}
      style={effect === "3d" ? { perspective: 1400 } : undefined}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  effect = "up",
  idle = false,
  phase = 0,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  idle?: RevealIdle;
  phase?: number;
}) {
  const inner =
    idle ? (
      <IdleMotion kind={idle} phase={phase} delay={0.4}>
        {children}
      </IdleMotion>
    ) : (
      children
    );

  return (
    <motion.div
      className={className}
      variants={effect === "3d" ? item3d : itemUp}
      style={effect === "3d" ? { transformStyle: "preserve-3d" } : undefined}
      whileHover={{
        y: effect === "3d" ? -12 : -8,
        rotateY: effect === "3d" ? 6 : 0,
        scale: 1.02,
        transition: { type: "spring", stiffness: 280, damping: 18 },
      }}
    >
      {inner}
    </motion.div>
  );
}
