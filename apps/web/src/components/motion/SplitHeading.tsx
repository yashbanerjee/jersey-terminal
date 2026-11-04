"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/format";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  /** Highlight these words (1-based index) with an accent gradient. */
  accentWords?: number[];
  /** Gradient class for accent words. Defaults to the orange "fire" gradient. */
  accentClass?: string;
  delay?: number;
};

/** Heading where each word slides up from a clipped line, like a title card. */
export function SplitHeading({
  text,
  className,
  as = "h2",
  accentWords = [],
  accentClass = "jt-gradient-text-fire",
  delay = 0,
}: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <Tag
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, amount: 0.4, margin: "0px 0px -8% 0px" }}
      transition={{ staggerChildren: 0.07, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="overflow-hidden pb-[0.08em]" aria-hidden>
          <motion.span
            className={cn("inline-block pr-[0.06em]", accentWords.includes(i + 1) && accentClass)}
            variants={{
              hidden: { y: "115%", skewX: -10, opacity: 0.4 },
              show: {
                y: 0,
                skewX: 0,
                opacity: 1,
                transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
              },
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
