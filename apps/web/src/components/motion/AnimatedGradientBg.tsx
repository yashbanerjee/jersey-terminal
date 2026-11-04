"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Cinematic stadium-night atmosphere.
 *
 * Layers (back → front):
 *  1. Deep ink mesh gradient base (violet top-left, lime bottom-right)
 *  2. Three drifting colour blobs — lime / violet / cyan
 *  3. Two counter-rotating conic auroras
 *  4. Sweeping floodlight beams
 *  5. Expanding pulse rings + floating sparks
 *  6. Scanline, perspective grid, light vignette, film grain
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

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !root.current) return;

    const ctx = gsap.context(() => {
      // Colour blobs drift in slow, non-synchronised loops
      gsap.to(".jt-blob-a", {
        x: "+=14vw",
        y: "+=10vh",
        scale: 1.18,
        duration: 18,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to(".jt-blob-b", {
        x: "-=16vw",
        y: "+=14vh",
        scale: 1.12,
        duration: 22,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
      gsap.to(".jt-blob-c", {
        x: "+=10vw",
        y: "-=16vh",
        scale: 1.25,
        duration: 26,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 4,
      });

      gsap.to(".jt-aurora", { rotate: 360, duration: full ? 40 : 70, repeat: -1, ease: "none" });
      gsap.to(".jt-aurora-2", { rotate: -360, duration: full ? 55 : 90, repeat: -1, ease: "none" });

      gsap.fromTo(
        ".jt-beam",
        { xPercent: -30, opacity: full ? 0.2 : 0.08 },
        {
          xPercent: 30,
          opacity: full ? 0.6 : 0.22,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 1.4,
        },
      );

      gsap.to(".jt-ring", {
        scale: 1.6,
        opacity: 0,
        duration: 5,
        repeat: -1,
        ease: "power1.out",
        stagger: 1.6,
      });

      gsap.to(".jt-spark", {
        y: "-=34",
        x: "+=14",
        opacity: full ? 1 : 0.5,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.22, from: "random" },
      });

      gsap.fromTo(
        ".jt-scan",
        { yPercent: -120, opacity: 0 },
        {
          yPercent: 120,
          opacity: full ? 0.4 : 0.16,
          duration: 7.5,
          repeat: -1,
          ease: "power1.inOut",
          repeatDelay: 2.5,
        },
      );
    }, root);

    return () => ctx.revert();
  }, [full]);

  const sparks = full ? 22 : 10;
  const sparkColors = ["#a4ff14", "#22d3ee", "#e9ff3a", "#c084fc"];

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* 1. Mesh base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(91,33,182,0.42), transparent 60%)," +
            "radial-gradient(ellipse 70% 55% at 95% 100%, rgba(164,255,20,0.16), transparent 60%)," +
            "radial-gradient(ellipse 50% 40% at 80% 10%, rgba(34,211,238,0.12), transparent 60%)," +
            "linear-gradient(180deg, #07081a 0%, #06070d 55%, #080a14 100%)",
        }}
      />

      {/* 2. Colour blobs */}
      <div
        className="jt-blob-a absolute -left-[10%] top-[5%] h-[70vmin] w-[70vmin] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(164,255,20,0.55) 0%, rgba(164,255,20,0.12) 40%, transparent 70%)",
          filter: "blur(30px)",
          opacity: full ? 0.75 : 0.5,
        }}
      />
      <div
        className="jt-blob-b absolute right-[-12%] top-[-10%] h-[80vmin] w-[80vmin] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(139,92,246,0.7) 0%, rgba(139,92,246,0.18) 40%, transparent 70%)",
          filter: "blur(36px)",
          opacity: full ? 0.8 : 0.55,
        }}
      />
      <div
        className="jt-blob-c absolute bottom-[-20%] left-[30%] h-[75vmin] w-[75vmin] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(34,211,238,0.5) 0%, rgba(34,211,238,0.12) 40%, transparent 70%)",
          filter: "blur(34px)",
          opacity: full ? 0.6 : 0.4,
        }}
      />

      {/* 3. Conic auroras */}
      <div
        className="jt-aurora absolute left-1/2 top-1/2 h-[150vmax] w-[150vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: full ? 0.5 : 0.28,
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(164,255,20,0.5) 40deg, transparent 90deg, rgba(139,92,246,0.5) 150deg, transparent 200deg, rgba(34,211,238,0.4) 260deg, transparent 310deg, rgba(233,255,58,0.35) 340deg, transparent 360deg)",
          filter: "blur(48px)",
        }}
      />
      <div
        className="jt-aurora-2 absolute left-1/2 top-[40%] h-[110vmax] w-[110vmax] -translate-x-1/2 -translate-y-1/2"
        style={{
          opacity: full ? 0.38 : 0.18,
          background:
            "conic-gradient(from 90deg, transparent 0deg, rgba(192,132,252,0.45) 50deg, transparent 110deg, rgba(164,255,20,0.3) 200deg, transparent 260deg, rgba(34,211,238,0.3) 320deg, transparent 360deg)",
          filter: "blur(56px)",
        }}
      />

      {/* 4. Floodlight beams */}
      <div
        className="jt-beam absolute -left-[10%] top-[-20%] h-[160%] w-[18%] origin-top rotate-[18deg]"
        style={{
          background: "linear-gradient(180deg, rgba(164,255,20,0.5) 0%, rgba(164,255,20,0.08) 40%, transparent 75%)",
          filter: "blur(18px)",
        }}
      />
      <div
        className="jt-beam absolute left-[38%] top-[-30%] h-[160%] w-[12%] origin-top rotate-[-8deg]"
        style={{
          background: "linear-gradient(180deg, rgba(139,92,246,0.5) 0%, rgba(139,92,246,0.08) 45%, transparent 80%)",
          filter: "blur(22px)",
        }}
      />
      <div
        className="jt-beam absolute right-[5%] top-[-25%] h-[160%] w-[16%] origin-top rotate-[28deg]"
        style={{
          background: "linear-gradient(180deg, rgba(34,211,238,0.45) 0%, rgba(233,255,58,0.08) 40%, transparent 75%)",
          filter: "blur(20px)",
        }}
      />

      {/* 5. Pulse rings */}
      <div className="absolute left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="jt-ring absolute left-1/2 top-1/2 h-[30vmin] w-[30vmin] -translate-x-1/2 -translate-y-1/2 rounded-full border"
            style={{
              opacity: full ? 0.4 : 0.14,
              borderColor: i === 1 ? "rgba(139,92,246,0.8)" : i === 2 ? "rgba(34,211,238,0.7)" : "rgba(164,255,20,0.8)",
            }}
          />
        ))}
      </div>

      {/* Sparks */}
      {Array.from({ length: sparks }).map((_, i) => {
        const c = sparkColors[i % sparkColors.length];
        const size = i % 3 === 0 ? 4 : 2;
        return (
          <span
            key={i}
            className="jt-spark absolute block rounded-full"
            style={{
              width: size,
              height: size,
              left: `${6 + ((i * 17) % 88)}%`,
              top: `${10 + ((i * 23) % 74)}%`,
              background: c,
              opacity: full ? 0.65 : 0.3,
              boxShadow: full ? `0 0 14px 3px ${c}99` : `0 0 8px 1px ${c}66`,
            }}
          />
        );
      })}

      {/* 6. Scanline */}
      <div
        className="jt-scan absolute inset-x-0 h-32"
        style={{
          background:
            "linear-gradient(180deg, transparent, rgba(164,255,20,0.16), rgba(34,211,238,0.12), transparent)",
          filter: "blur(6px)",
        }}
      />

      {/* Perspective grid */}
      <div
        className="absolute inset-0"
        style={{
          opacity: full ? 0.12 : 0.06,
          backgroundImage:
            "linear-gradient(rgba(164,255,20,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.5) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse at 50% 45%, black 10%, transparent 72%)",
        }}
      />

      {/* Light vignette — keeps edges grounded without killing the colour */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgba(6,7,13,0.35)_75%,rgba(6,7,13,0.7)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-jt-black to-transparent" />

      {/* Film grain */}
      <div className="jt-grain absolute inset-0 opacity-[0.07]" />
    </div>
  );
}
