"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const COLORS = ["#b4ff1a", "#2ee6ff", "#ff7a1a", "#ffb020", "#ffffff", "#d9ff3d"];

type Particle = {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
  rotate: number;
  delay: number;
};

/** Sparse neon confetti burst for checkout success — runs once on mount. */
export function NeonBurst({ count = 36 }: { count?: number }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);
  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / count + (i % 3) * 0.15;
        const dist = 80 + (i % 7) * 28;
        return {
          id: i,
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 40,
          color: COLORS[i % COLORS.length],
          size: 4 + (i % 4) * 2,
          rotate: (i * 47) % 360,
          delay: (i % 8) * 0.02,
        };
      }),
    [count],
  );

  useEffect(() => {
    if (reduce) return;
    const t = window.setTimeout(() => setShow(false), 2200);
    return () => window.clearTimeout(t);
  }, [reduce]);

  if (reduce || !show) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      <motion.div
        className="absolute left-1/2 top-[38%] h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(180,255,26,0.45),rgba(255,122,26,0.2)_45%,transparent_70%)] blur-2xl"
        initial={{ opacity: 0, scale: 0.4 }}
        animate={{ opacity: [0, 1, 0], scale: [0.4, 1.4, 1.8] }}
        transition={{ duration: 1.1, ease: "easeOut" }}
      />
      {particles.map((p) => (
        <motion.span
          key={p.id}
          className="absolute left-1/2 top-[38%] rounded-[2px]"
          style={{
            width: p.size,
            height: p.size * (p.id % 3 === 0 ? 2.4 : 1),
            background: p.color,
            boxShadow: `0 0 10px ${p.color}`,
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{
            x: p.x,
            y: p.y + 120,
            opacity: [1, 1, 0],
            scale: [0.4, 1.1, 0.7],
            rotate: p.rotate,
          }}
          transition={{ duration: 1.35, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
        />
      ))}
    </div>
  );
}
