"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/format";

type Props = {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  /** Highlight these words (1-based index) with the brand gradient. */
  accentWords?: number[];
  delay?: number;
};

/** Heading where each word slides up from a clipped line, like a title card. */
export function SplitHeading({ text, className, as = "h2", accentWords = [], delay = 0 }: Props) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  const Tag = motion[as];

  return (
    <Tag
      className={cn("flex flex-wrap gap-x-[0.25em]", className)}
      initial={reduce ? false : "hidden"}
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={`${w}-${i}`} className="overflow-hidden pb-[0.08em]" aria-hidden>
          <motion.span
            className={cn("inline-block", accentWords.includes(i + 1) && "jt-gradient-text")}
            variants={{
              hidden: { y: "110%", rotate: 3 },
              show: { y: 0, rotate: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
            }}
          >
            {w}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
