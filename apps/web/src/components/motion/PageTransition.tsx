"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { isMobilePerfTarget } from "@/lib/perf";

/** Soft fade on route change. Mobile skips blur/3D (expensive compositing). */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const [lite, setLite] = useState(false);

  useEffect(() => {
    setLite(isMobilePerfTarget());
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={
          reduce
            ? false
            : lite
              ? { opacity: 0, y: 12 }
              : { opacity: 0, y: 42, filter: "blur(14px)", scale: 0.97, rotateX: 6 }
        }
        animate={
          lite
            ? { opacity: 1, y: 0 }
            : { opacity: 1, y: 0, filter: "blur(0px)", scale: 1, rotateX: 0 }
        }
        exit={
          reduce
            ? undefined
            : lite
              ? { opacity: 0, y: -8, transition: { duration: 0.18 } }
              : { opacity: 0, y: -20, filter: "blur(8px)", scale: 0.985, transition: { duration: 0.3 } }
        }
        transition={{ duration: lite ? 0.28 : 0.75, ease: [0.16, 1, 0.3, 1] }}
        className="w-full"
        style={lite ? undefined : { transformPerspective: 1400 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
