"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

type Props = {
  text: string;
  className?: string;
  as?: "span" | "p";
  children?: ReactNode;
};

/** Cyber / sports-broadcast scramble on hover — snaps back to the real label. */
export function HoverScramble({ text, className, as: Tag = "span" }: Props) {
  const reduce = useReducedMotion();
  const [out, setOut] = useState(text);
  const frame = useRef(0);
  const timer = useRef<number | null>(null);

  function scramble() {
    if (reduce) return;
    if (timer.current) window.clearInterval(timer.current);
    frame.current = 0;
    timer.current = window.setInterval(() => {
      frame.current += 1;
      setOut(
        text
          .split("")
          .map((ch, i) => {
            if (ch === " " || ch === "·" || ch === "&") return ch;
            if (i < frame.current / 1.6) return text[i];
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join(""),
      );
      if (frame.current > text.length * 1.6) {
        if (timer.current) window.clearInterval(timer.current);
        setOut(text);
      }
    }, 28);
  }

  function reset() {
    if (timer.current) window.clearInterval(timer.current);
    setOut(text);
  }

  return (
    <Tag className={className} onMouseEnter={scramble} onMouseLeave={reset} onFocus={scramble} onBlur={reset}>
      {out}
    </Tag>
  );
}
