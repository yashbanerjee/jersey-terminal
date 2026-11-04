"use client";

import { useEffect } from "react";
import Lenis from "lenis";

let instance: Lenis | null = null;

/** Freeze/unfreeze page scrolling (works with and without smooth scroll). */
export function lockScroll(locked: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = locked ? "hidden" : "";
  if (locked) instance?.stop();
  else instance?.start();
}

/** Site-wide inertial smooth scrolling, synced with GSAP ScrollTrigger. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    instance = lenis;
    let raf = 0;
    let st: typeof import("gsap/ScrollTrigger").ScrollTrigger | null = null;

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      st = ScrollTrigger;
      lenis.on("scroll", ScrollTrigger.update);
    });

    // Keep Framer Motion whileInView / IntersectionObserver in sync with Lenis
    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("scroll"));
    });

    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      if (st) lenis.off("scroll", st.update);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
