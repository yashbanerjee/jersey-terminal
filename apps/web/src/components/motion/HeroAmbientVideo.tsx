"use client";

/** Static stadium still — video + Ken Burns were burning GPU while scrolling. */
export function HeroAmbientVideo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.32]"
        style={{ backgroundImage: "url(/bg/stadium-night.jpg)" }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,6,7,0.55)_0%,rgba(5,6,7,0.35)_40%,rgba(5,6,7,0.75)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_20%,rgba(180,255,26,0.12),transparent_55%)]" />
    </div>
  );
}
