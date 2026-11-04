"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { Marquee } from "@/components/motion/Marquee";

const ITEMS = [
  "Free UAE delivery over AED 250",
  "Personalise name & number",
  "Apple Pay & Google Pay accepted",
  "Worldwide shipping",
  "Limited editions drop weekly",
  "Secure checkout",
];

export function TickerStrip() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const reduce = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: false, amount: 0.35 }}
      animate={
        reduce || !inView
          ? undefined
          : { y: [0, -3, 0] }
      }
      transition={{
        opacity: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        scale: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
        y: inView && !reduce ? { duration: 4, repeat: Infinity, ease: "easeInOut" } : { duration: 0.7 },
      }}
      className="relative w-full overflow-hidden py-3 sm:py-4"
    >
      <div className="jt-divider absolute inset-x-0 top-0" />
      <div className="jt-divider absolute inset-x-0 bottom-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,122,26,0.16),rgba(5,6,7,0.7)_30%,rgba(5,6,7,0.7)_70%,rgba(46,230,255,0.14))] backdrop-blur-sm" />
      <div className="relative">
        <Marquee items={ITEMS} speed={30} />
      </div>
    </motion.div>
  );
}
