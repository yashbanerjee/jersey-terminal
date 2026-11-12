"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Soft neon slap — subtle rings + rim light on kit swap (no harsh white flash). */
export function SlideImpact({ triggerKey }: { triggerKey: string | number }) {
  const reduce = useReducedMotion();
  const [burst, setBurst] = useState(0);
  const first = useRef(true);

  useEffect(() => {
    if (reduce) return;
    if (first.current) {
      first.current = false;
      return;
    }
    setBurst((n) => n + 1);
  }, [triggerKey, reduce]);

  if (reduce) return null;

  return (
    <AnimatePresence>
      {burst > 0 && (
        <motion.div
          key={burst}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-40 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.span
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(180,255,26,0.18),rgba(255,122,26,0.08)_38%,transparent_62%)] mix-blend-screen"
            initial={{ opacity: 0.7, scale: 0.92 }}
            animate={{ opacity: 0, scale: 1.08 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="absolute left-1/2 top-[46%] h-[72%] w-[72%] -translate-x-1/2 -translate-y-1/2 rounded-[1.5rem] border border-jt-neon/50 shadow-[0_0_36px_rgba(180,255,26,0.35)]"
            style={{ clipPath: "polygon(8% 0, 100% 0, 100% 92%, 92% 100%, 0 100%, 0 8%)" }}
            initial={{ scale: 0.82, opacity: 0.9 }}
            animate={{ scale: 1.12, opacity: 0 }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="absolute left-1/2 top-[46%] h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-[1.25rem] border border-jt-orange/45"
            style={{ clipPath: "polygon(8% 0, 100% 0, 100% 92%, 92% 100%, 0 100%, 0 8%)" }}
            initial={{ scale: 0.9, opacity: 0.75 }}
            animate={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
