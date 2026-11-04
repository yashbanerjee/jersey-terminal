"use client";

/**
 * Static stadium-night photo backdrop.
 * No GSAP, blur fog, or mix-blend layers — those were the main scroll FPS killers.
 */
export function AnimatedGradientBg({
  className = "",
}: {
  className?: string;
  intensity?: "full" | "subtle";
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden bg-black ${className}`}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 78% 18%, rgba(180,255,26,0.14), transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 50% 55%, rgba(80,160,40,0.08), transparent 65%)," +
            "linear-gradient(180deg, #000000 0%, #030805 50%, #000000 100%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: "10%",
          width: "100%",
          aspectRatio: "1024 / 507",
          backgroundImage: "url('/bg/stadium-night.jpg')",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center center",
          backgroundSize: "100% 100%",
          opacity: 0.85,
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, #000 4%, #000 92%, transparent 100%)",
          maskImage:
            "linear-gradient(180deg, transparent 0%, #000 4%, #000 92%, transparent 100%)",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(100deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.18) 30%, transparent 55%)",
        }}
      />
    </div>
  );
}
