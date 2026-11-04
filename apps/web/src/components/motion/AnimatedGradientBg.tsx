"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * Stadium-night "speed" atmosphere, matched to the reference art direction.
 *
 * Layers (back → front):
 *  1. Near-black base with a faint cool/warm split
 *  2. Floodlights along the top edge (bright cores + wide halos + lens flare bars)
 *  3. Diagonal light streaks in orange / cyan / white that sweep across
 *  4. Soft pitch fog drifting along the bottom
 *  5. Sparks, halftone dot patches, vignette, film grain
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
      // Streaks slide along their own diagonal and breathe in opacity
      gsap.utils.toArray<HTMLElement>(".jt-streak").forEach((el, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        gsap.fromTo(
          el,
          { xPercent: -35 * dir, opacity: 0 },
          {
            xPercent: 35 * dir,
            opacity: Number(el.dataset.peak ?? 0.6),
            duration: 7 + (i % 4) * 1.6,
            repeat: -1,
            yoyo: true,
            ease: "sine.inOut",
            delay: i * 0.45,
          },
        );
      });

      // Fog banks drift slowly sideways
      gsap.to(".jt-fog-a", { x: "+=12vw", duration: 26, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".jt-fog-b", { x: "-=14vw", duration: 32, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3 });

      // Floodlight halos pulse
      gsap.to(".jt-halo", {
        scale: 1.12,
        opacity: full ? 0.9 : 0.5,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.4,
      });

      gsap.to(".jt-spark", {
        y: "-=40",
        x: "+=18",
        opacity: full ? 1 : 0.5,
        duration: 3.4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.2, from: "random" },
      });
    }, root);

    return () => ctx.revert();
  }, [full]);

  // Streak definitions: [top%, left%, rotation, length vw, thickness px, colour, peak opacity]
  const streaks: Array<[number, number, number, number, number, string, number]> = full
    ? [
        [18, -10, -22, 70, 3, "255,122,26", 0.9],
        [30, 10, -22, 55, 2, "46,230,255", 0.8],
        [42, -20, -22, 80, 6, "255,122,26", 0.55],
        [55, 20, -22, 60, 2, "255,255,255", 0.5],
        [66, -15, -22, 75, 4, "46,230,255", 0.7],
        [78, 5, -22, 50, 2, "255,176,32", 0.7],
        [88, -5, -22, 65, 3, "46,230,255", 0.5],
        [26, 45, -22, 45, 1.5, "255,255,255", 0.6],
        [72, 50, -22, 55, 3, "255,122,26", 0.65],
      ]
    : [
        [20, -10, -22, 70, 2, "255,122,26", 0.45],
        [45, 15, -22, 60, 2, "46,230,255", 0.4],
        [70, -15, -22, 75, 3, "255,122,26", 0.3],
        [85, 30, -22, 50, 1.5, "46,230,255", 0.35],
      ];

  // Floodlights only in the hero; on the fixed page layer they'd hang mid-page while scrolling.
  // x positions in %, kept away from the centre so cores never sit on the nav.
  const lights = full ? [9, 30, 68, 91] : [];
  const sparks = full ? 18 : 8;
  const sparkColors = ["#ff7a1a", "#2ee6ff", "#ffb020", "#ffffff"];

  return (
    <div ref={root} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {/* 1. Base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 100% 100%, rgba(255,122,26,0.14), transparent 60%)," +
            "radial-gradient(ellipse 60% 50% at 0% 90%, rgba(46,230,255,0.12), transparent 60%)," +
            "linear-gradient(180deg, #07090c 0%, #050607 50%, #06070a 100%)",
        }}
      />

      {/* 2. Floodlights */}
      {lights.map((x, i) => (
        <div key={x} className="absolute top-0" style={{ left: `${x}%` }}>
          <div
            className="jt-halo absolute -translate-x-1/2 -translate-y-1/3 rounded-full"
            style={{
              width: full ? "34vmin" : "26vmin",
              height: full ? "34vmin" : "26vmin",
              top: full ? "12vh" : "10vh",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.55) 0%, rgba(200,235,255,0.25) 25%, transparent 65%)",
              filter: "blur(10px)",
              opacity: full ? 0.7 : 0.35,
            }}
          />
          <div
            className="jt-flicker absolute -translate-x-1/2 rounded-full"
            style={{
              width: full ? 12 : 8,
              height: full ? 12 : 8,
              top: full ? "12vh" : "10vh",
              background: "#ffffff",
              boxShadow: "0 0 24px 8px rgba(255,255,255,0.9), 0 0 60px 20px rgba(180,230,255,0.5)",
              animationDelay: `${i * 0.7}s`,
            }}
          />
          {/* lens-flare bar */}
          <div
            className="absolute -translate-x-1/2"
            style={{
              top: full ? "calc(12vh + 5px)" : "calc(10vh + 3px)",
              width: full ? "22vmin" : "14vmin",
              height: 2,
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
              filter: "blur(1px)",
              opacity: full ? 0.8 : 0.4,
            }}
          />
          {/* light cone */}
          <div
            className="absolute -translate-x-1/2"
            style={{
              top: full ? "12vh" : "10vh",
              width: full ? "40vmin" : "28vmin",
              height: full ? "90vmin" : "60vmin",
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(200,235,255,0.05) 40%, transparent 75%)",
              clipPath: "polygon(50% 0, 100% 100%, 0 100%)",
              filter: "blur(14px)",
              opacity: full ? 0.7 : 0.35,
            }}
          />
        </div>
      ))}

      {/* 3. Speed streaks */}
      {streaks.map(([top, left, rot, len, thick, rgb, peak], i) => (
        <div
          key={i}
          className="jt-streak"
          data-peak={peak}
          style={{
            top: `${top}%`,
            left: `${left}%`,
            width: `${len}vw`,
            height: thick,
            transform: `rotate(${rot}deg)`,
            background: `linear-gradient(90deg, transparent, rgba(${rgb},0.15) 20%, rgba(${rgb},1) 50%, rgba(${rgb},0.15) 80%, transparent)`,
            boxShadow: `0 0 ${thick * 6}px ${thick}px rgba(${rgb},0.45)`,
            filter: thick > 4 ? "blur(3px)" : "blur(0.6px)",
            opacity: 0,
          }}
        />
      ))}

      {/* Wide soft glow bands behind the streaks for depth */}
      <div
        className="absolute left-[-20%] top-[30%] h-[22vh] w-[140%] -rotate-[22deg]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,122,26,0.22), transparent)",
          filter: "blur(40px)",
          opacity: full ? 0.9 : 0.5,
        }}
      />
      <div
        className="absolute left-[-20%] top-[62%] h-[18vh] w-[140%] -rotate-[22deg]"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(46,230,255,0.2), transparent)",
          filter: "blur(40px)",
          opacity: full ? 0.9 : 0.5,
        }}
      />

      {/* 4. Pitch fog */}
      <div
        className="jt-fog jt-fog-a absolute -bottom-[10%] left-[-10%] h-[45vh] w-[70vw] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(255,255,255,0.16), rgba(255,255,255,0.04) 50%, transparent 70%)",
          filter: "blur(30px)",
          opacity: full ? 0.9 : 0.5,
        }}
      />
      <div
        className="jt-fog jt-fog-b absolute -bottom-[15%] right-[-10%] h-[40vh] w-[60vw] rounded-full"
        style={{
          background: "radial-gradient(ellipse, rgba(255,160,80,0.18), rgba(255,255,255,0.04) 50%, transparent 70%)",
          filter: "blur(34px)",
          opacity: full ? 0.9 : 0.5,
        }}
      />

      {/* 5. Sparks */}
      {Array.from({ length: sparks }).map((_, i) => {
        const c = sparkColors[i % sparkColors.length];
        const size = i % 3 === 0 ? 3 : 2;
        return (
          <span
            key={i}
            className="jt-spark absolute block rounded-full"
            style={{
              width: size,
              height: size,
              left: `${6 + ((i * 17) % 88)}%`,
              top: `${20 + ((i * 23) % 70)}%`,
              background: c,
              opacity: full ? 0.6 : 0.3,
              boxShadow: `0 0 10px 2px ${c}99`,
            }}
          />
        );
      })}

      {/* Halftone dot patches */}
      <div className="jt-dots absolute right-[-4%] top-[8%] h-[40vh] w-[22vw] opacity-[0.22]" />
      <div className="jt-dots absolute bottom-[6%] left-[-4%] h-[30vh] w-[18vw] opacity-[0.16]" />

      {/* Vignette + ground fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,6,7,0.4)_78%,rgba(5,6,7,0.8)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-jt-black to-transparent" />

      {/* Film grain */}
      <div className="jt-grain absolute inset-0 opacity-[0.07]" />
    </div>
  );
}
