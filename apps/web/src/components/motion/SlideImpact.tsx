"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

/** Sound-free punch — brief flash + scale ring when a slide index changes. */
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
          className="pointer-events-none absolute inset-0 z-40 grid place-items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <motion.span
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(180,255,26,0.28),rgba(255,122,26,0.12)_40%,transparent_65%)] mix-blend-screen"
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
          <motion.span
            className="h-24 w-24 rounded-full border border-jt-neon/70 shadow-[0_0_40px_rgba(180,255,26,0.55)]"
            initial={{ scale: 0.35, opacity: 0.95 }}
            animate={{ scale: 2.4, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.span
            className="absolute h-16 w-16 rounded-full border border-jt-orange/60"
            initial={{ scale: 0.5, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            transition={{ duration: 0.45, delay: 0.04, ease: [0.22, 1, 0.36, 1] }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
