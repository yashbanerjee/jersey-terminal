"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isMobilePerfTarget, prefersReducedMotion } from "@/lib/perf";

/**
 * Exact stadium-night photo (`/bg/stadium-night.jpg`) as the site backdrop.
 * Mobile keeps a static photo — no blur layers or GSAP (scroll jank).
 */
export function AnimatedGradientBg({
  className = "",
  intensity = "full",
}: {
  className?: string;
  intensity?: "full" | "subtle";
}) {
  const root = useRef<HTMLDivElement>(null);
  const full = intensity === "full";
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || isMobilePerfTarget() || !root.current) return;
    setAnimate(true);

    const ctx = gsap.context(() => {
      gsap.to(".jt-stadium-bloom", {
        opacity: full ? 0.9 : 0.55,
        scale: 1.06,
        duration: 4.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".jt-fog-a", {
        x: "+=7vw",
        duration: 30,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".jt-fog-b", {
        x: "-=9vw",
        duration: 36,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, root);

    return () => ctx.revert();
  }, [full]);

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden bg-black ${className}`}>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 78% 18%, rgba(180,255,26,0.2), transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 50% 55%, rgba(80,160,40,0.12), transparent 65%)," +
            "radial-gradient(ellipse 60% 35% at 20% 90%, rgba(180,255,26,0.1), transparent 60%)," +
            "linear-gradient(180deg, #000000 0%, #030805 50%, #000000 100%)",
        }}
      />

      {animate && (
        <div
          className="jt-stadium-bloom absolute right-[-2%] top-[-6%] h-[60vmin] w-[60vmin] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(220,255,160,0.35) 0%, rgba(180,255,26,0.12) 40%, transparent 70%)",
            filter: "blur(30px)",
            opacity: 0.55,
            mixBlendMode: "screen",
          }}
        />
      )}

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
            "linear-gradient(100deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.12) 28%, transparent 50%)",
        }}
      />

      {animate && (
        <>
          <div
            className="jt-fog jt-fog-a absolute -bottom-[8%] left-[-10%] h-[38vh] w-[60vw] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(180,255,26,0.14), transparent 70%)",
              filter: "blur(40px)",
              opacity: 0.55,
              mixBlendMode: "screen",
            }}
          />
          <div
            className="jt-fog jt-fog-b absolute -bottom-[10%] right-[-8%] h-[34vh] w-[52vw] rounded-full"
            style={{
              background: "radial-gradient(ellipse, rgba(200,255,120,0.12), transparent 70%)",
              filter: "blur(44px)",
              opacity: 0.5,
              mixBlendMode: "screen",
            }}
          />
        </>
      )}
    </div>
  );
}
