"use client";

import { useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  value: string;
  className?: string;
  /** How long the count runs (ms). */
  durationMs?: number;
};

/**
 * Animates numeric parts of a label (e.g. "190+", "1–3 days") when scrolled into view.
 * Non-numeric text is preserved.
 */
export function CountUp({ value, className, durationMs = 1200 }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : value.replace(/\d+/g, "0"));

  useEffect(() => {
    if (!inView || reduce) {
      setDisplay(value);
      return;
    }

    const parts = value.split(/(\d+)/);
    const targets = parts.map((p) => (/^\d+$/.test(p) ? Number(p) : null));
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(
        parts
          .map((p, i) => {
            const target = targets[i];
            if (target === null) return p;
            return String(Math.round(target * eased));
          })
          .join(""),
      );
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [durationMs, inView, reduce, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
