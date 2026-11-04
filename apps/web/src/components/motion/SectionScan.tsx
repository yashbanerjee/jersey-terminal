"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";

/** A neon scan line that sweeps across when the section enters view. */
export function SectionScan({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.25 });
  const reduce = useReducedMotion();

  return (
    <div ref={ref} aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 z-[1] h-full overflow-hidden ${className}`}>
      {!reduce && inView && (
        <motion.span
          key={String(inView)}
          initial={{ x: "-30%", opacity: 0 }}
          animate={{ x: "130%", opacity: [0, 1, 1, 0] }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="absolute top-[18%] h-[2px] w-[40%] -rotate-[18deg] bg-[linear-gradient(90deg,transparent,rgba(180,255,26,0.85),rgba(46,230,255,0.7),transparent)] blur-[0.5px]"
        />
      )}
    </div>
  );
}
