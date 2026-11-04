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
            : { opacity: 0, y: 28, filter: "blur(10px)", scale: 0.98, rotateX: 4 }
        }
        animate={{ opacity: 1, y: 0, filter: "blur(0px)", scale: 1, rotateX: 0 }}
        exit={
          reduce
            ? undefined
            : { opacity: 0, y: -16, filter: "blur(6px)", scale: 0.99, transition: { duration: 0.28 } }
        }
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full"
        style={{ transformPerspective: 1200 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
