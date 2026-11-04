"use client";

import { motion } from "framer-motion";
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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full overflow-hidden py-3 sm:py-4"
    >
      <div className="jt-divider absolute inset-x-0 top-0" />
      <div className="jt-divider absolute inset-x-0 bottom-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,122,26,0.16),rgba(5,6,7,0.7)_30%,rgba(5,6,7,0.7)_70%,rgba(46,230,255,0.14))] backdrop-blur-sm" />
      <div className="relative">
        <Marquee items={ITEMS} speed={36} />
      </div>
    </motion.div>
  );
}
