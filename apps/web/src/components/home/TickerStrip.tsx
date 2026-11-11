"use client";

import { useEffect, useRef } from "react";
import { Marquee } from "@/components/motion/Marquee";

const ITEMS = [
  "United Tigers match & training kits",
  "Personalise name & number",
  "Custom team kits from MOQ 15",
  "Secure Stripe checkout · AED",
  "UAE · GCC · worldwide shipping",
  "WhatsApp sales support",
];

export function TickerStrip() {
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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="jt-reveal jt-reveal-up relative w-full overflow-hidden py-3 sm:py-4"
    >
      <div className="jt-divider absolute inset-x-0 top-0" />
      <div className="jt-divider absolute inset-x-0 bottom-0" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,122,26,0.16),rgba(5,6,7,0.7)_30%,rgba(5,6,7,0.7)_70%,rgba(46,230,255,0.14))]" />
      <div className="relative">
        <Marquee items={ITEMS} speed={30} />
      </div>
    </div>
  );
}
