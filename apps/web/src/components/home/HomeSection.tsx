"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Soft neon scan that fires once when a homepage section enters view.
 */
export function HomeSection({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("is-in");
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add("is-in");
        io.disconnect();
      },
      { threshold: 0.18 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`jt-home-section relative ${className}`.trim()}>
      <span aria-hidden className="jt-home-scan" />
      {children}
    </div>
  );
}
