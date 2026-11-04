"use client";

import { useReducedMotion } from "framer-motion";

const COLORS = ["#b4ff1a", "#2ee6ff", "#ff7a1a", "#ffffff", "#ffb020", "#d9ff3d"] as const;

/** More particles, slower rise — soft stadium-dust drift. */
const DOTS = Array.from({ length: 72 }).map((_, i) => ({
  id: i,
  left: `${2 + ((i * 13 + (i % 7) * 5) % 96)}%`,
  size: i % 7 === 0 ? 5 : i % 4 === 0 ? 3.5 : i % 3 === 0 ? 2.5 : 2,
  delay: (i % 18) * 0.85 + (i % 5) * 0.2,
  // ~12–22s per rise so the motion feels calm
  duration: 12 + (i % 8) * 1.25,
  color: COLORS[i % COLORS.length],
  opacity: 0.2 + (i % 5) * 0.1,
  drift: (i % 2 === 0 ? 1 : -1) * (8 + (i % 6) * 4),
}));

/**
 * Ambient small dots that drift slowly from the bottom of the screen upward.
 */
export function RisingDots({ className = "" }: { className?: string }) {
  const reduced = useReducedMotion();
  if (reduced) return null;

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {DOTS.map((d) => (
        <span
          key={d.id}
          className="jt-rise-dot absolute bottom-[-8%] rounded-full"
          style={{
            left: d.left,
            width: d.size,
            height: d.size,
            background: d.color,
            opacity: d.opacity,
            boxShadow: `0 0 ${d.size * 3.5}px ${d.color}`,
            animationDelay: `${d.delay}s`,
            animationDuration: `${d.duration}s`,
            // custom horizontal drift via CSS variable
            ["--jt-rise-x" as string]: `${d.drift}px`,
          }}
        />
      ))}
    </div>
  );
}
