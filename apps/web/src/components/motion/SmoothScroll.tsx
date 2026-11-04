"use client";

/**
 * Native scrolling only.
 * Lenis was keeping a perpetual rAF loop + ScrollTrigger sync that made
 * both desktop and mobile feel laggy while opening and scrolling.
 */

/** Freeze/unfreeze page scrolling. */
export function lockScroll(locked: boolean) {
  if (typeof document === "undefined") return;
  document.body.style.overflow = locked ? "hidden" : "";
}

/** No-op placeholder so layout import stays stable. */
export function SmoothScroll() {
  return null;
}
