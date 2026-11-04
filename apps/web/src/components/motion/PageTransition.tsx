"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Soft 3D fade/rise on every route change, with a short exit wipe. */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          reduce
            ? false
            : { opacity: 0, y: 42, filter: "blur(14px)", scale: 0.97, rotateX: 6 }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1, rotateX: 0 }}
        exit={
          reduce
            ? undefined
            : { opacity: 0, y: -20, filter: "blur(8px)", scale: 0.985, transition: { duration: 0.3 } }
        }
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        style={{ transformPerspective: 1400 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
