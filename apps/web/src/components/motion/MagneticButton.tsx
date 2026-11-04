"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline" | "fire";
};

/**
 * Slanted CTA that gently follows the cursor and fills with a sweeping highlight.
 * The shape is cut with clip-path, so the glow lives on the wrapper as a drop-shadow.
 */
export function MagneticButton({ href, children, className, variant = "solid" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(my, { stiffness: 220, damping: 18, mass: 0.4 });

  function onMove(e: MouseEvent<HTMLDivElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - (r.left + r.width / 2)) * 0.25);
    my.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  }
  function onLeave() {
    mx.set(0);
    my.set(0);
  }

  return (
    <motion.div
      ref={ref}
      style={{ x, y }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cn("inline-block", variant === "solid" && "jt-drop-lime", variant === "fire" && "jt-drop-orange")}
    >
      {/* Outer = fill (or 1px border colour for outline); inner = slanted face */}
      <Link
        href={href}
        className={cn(
          "jt-btn jt-slant group relative inline-flex transition-all duration-300 active:scale-[0.98]",
          variant === "solid" && "jt-gradient-bg",
          variant === "fire" && "jt-gradient-bg-fire",
          variant === "outline" && "bg-white/40 p-px hover:bg-white/80",
          className,
        )}
      >
        <span
          className={cn(
            "jt-slant relative inline-flex min-h-12 w-full items-center justify-center gap-2 overflow-hidden px-8 text-[13px] font-bold uppercase tracking-[0.16em] transition-colors duration-300",
            variant === "outline" ? "bg-jt-black/85 text-white backdrop-blur group-hover:bg-jt-black/60" : "text-jt-black",
          )}
        >
          <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
          <span
            aria-hidden
            className={cn(
              "jt-btn-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg]",
              variant === "outline" ? "bg-white/15" : "bg-white/40",
            )}
          />
        </span>
      </Link>
    </motion.div>
  );
}
