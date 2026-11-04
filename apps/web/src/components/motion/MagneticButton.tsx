"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import Link from "next/link";
import { useRef, type MouseEvent, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "solid" | "outline";
};

/** CTA that gently follows the cursor and fills with a sweeping highlight. */
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
    <motion.div ref={ref} style={{ x, y }} onMouseMove={onMove} onMouseLeave={onLeave} className="inline-block">
      <Link
        href={href}
        className={cn(
          "jt-btn group relative inline-flex min-h-12 items-center justify-center gap-2 overflow-hidden rounded-md px-7 text-sm font-bold uppercase tracking-[0.18em] transition-all duration-300 active:scale-[0.98]",
          variant === "solid"
            ? "jt-gradient-bg text-jt-black shadow-[0_10px_30px_-12px_rgba(164,255,20,0.55)] hover:shadow-[0_18px_50px_-12px_rgba(164,255,20,0.75)]"
            : "border border-white/20 bg-white/[0.03] text-white backdrop-blur hover:border-jt-neon/70 hover:bg-jt-neon/10 hover:shadow-[0_10px_40px_-14px_rgba(164,255,20,0.5)]",
          className,
        )}
      >
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
        <span
          aria-hidden
          className={cn(
            "jt-btn-sheen pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 skew-x-[-20deg]",
            variant === "solid" ? "bg-white/40" : "bg-jt-neon/15",
          )}
        />
      </Link>
    </motion.div>
  );
}
