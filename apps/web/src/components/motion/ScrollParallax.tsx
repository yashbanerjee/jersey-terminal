"use client";

import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Max vertical travel in px as the section scrolls through the viewport. */
  distance?: number;
  /** Horizontal drift in px (positive = right). */
  xDistance?: number;
  /** Mild scale pulse tied to scroll progress. */
  scale?: number;
};

/**
 * Scroll-linked drift — elements keep moving while you scroll past them.
 */
export function ScrollParallax({
  children,
  className,
  distance = 60,
  xDistance = 0,
  scale = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const y = useTransform(smooth, [0, 1], [distance, -distance]);
  const x = useTransform(smooth, [0, 1], [-xDistance, xDistance]);
  const s = useTransform(smooth, [0, 0.5, 1], [1, 1 + scale, 1]);

  if (reduce) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} className={className} style={{ y, x, scale: s }}>
      {children}
    </motion.div>
  );
}
