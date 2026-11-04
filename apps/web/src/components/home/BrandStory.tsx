"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function BrandStory() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let kill: (() => void) | undefined;
    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".story-line",
          { y: 60, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.9,
            scrollTrigger: { trigger: ref.current, start: "top 70%" },
          },
        );
      }, ref);
      kill = () => ctx.revert();
    })();
    return () => kill?.();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden border-y border-white/5 bg-jt-dark/70 py-16 backdrop-blur-sm sm:py-20 md:py-24"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(180,255,26,0.14),transparent_45%),radial-gradient(circle_at_right,rgba(255,122,26,0.18),transparent_45%)]" />
      <div className="relative jt-container text-center">
        <p className="story-line text-xs uppercase tracking-[0.3em] text-jt-neon">
          The JT Standard
        </p>
        <h2 className="story-line mx-auto mt-4 max-w-5xl jt-display text-4xl tracking-wide sm:text-5xl md:text-7xl">
          Built for the pitch.
          <br />
          Worn beyond it.
        </h2>
        <p className="story-line mx-auto mt-5 max-w-3xl text-sm text-jt-muted sm:mt-6 sm:text-base">
          From match-day jerseys to training layers and fan essentials, every
          drop is curated for athletes and supporters who demand premium
          presentation and performance-ready detail.
        </p>
      </div>
    </section>
  );
}
