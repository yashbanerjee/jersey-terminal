"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, ChevronDown, Globe, PenLine, Shirt, Star, Zap } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProgressDots } from "@/components/motion/ProgressDots";
import { formatAED } from "@/lib/format";

const HERO_SLIDE_MS = 3000;

export type HeroProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  image?: { src: string; alt: string };
};

const STATS = [
  { icon: Shirt, value: "6+", label: "Jersey styles", color: "text-jt-cyan" },
  { icon: Zap, value: "1–3 days", label: "UAE delivery", color: "text-jt-orange" },
  { icon: Globe, value: "190+", label: "Countries shipped", color: "text-jt-cyan" },
];

const slide3d = {
  enter: (dir: number) => ({
    x: dir > 0 ? 120 : -120,
    rotateY: dir > 0 ? -28 : 28,
    opacity: 0,
    scale: 0.88,
  }),
  center: {
    x: 0,
    rotateY: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -120 : 120,
    rotateY: dir > 0 ? 28 : -28,
    opacity: 0,
    scale: 0.88,
  }),
};

export function Hero({ products = [] }: { products?: HeroProduct[] }) {
  const root = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const featured = products[index] ?? products[0];

  useEffect(() => {
    if (reduced || paused || products.length < 2) return;
    const id = window.setInterval(() => {
      setDir(1);
      setIndex((i) => (i + 1) % products.length);
    }, HERO_SLIDE_MS);
    return () => window.clearInterval(id);
  }, [paused, products.length, reduced]);

  // Unstick pause after returning from a background tab
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const motionOff = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let kill: (() => void) | undefined;

    const ctx = gsap.context(() => {
      if (motionOff) {
        gsap.set([".hero-line", ".hero-fade", ".hero-visual"], { opacity: 1, y: 0, x: 0, yPercent: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-line", { yPercent: 110, skewX: -8 }, { yPercent: 0, skewX: 0, duration: 1.1, stagger: 0.1 }, 0.1)
        .fromTo(".hero-fade", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.5)
        .fromTo(
          ".hero-visual",
          { opacity: 0, x: 80, scale: 0.92, rotate: 3 },
          { opacity: 1, x: 0, scale: 1, rotate: 0, duration: 1.3 },
          0.25,
        )
        .fromTo(".hero-chip", { opacity: 0, scale: 0.8, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.12 }, 1);

      gsap.to(".hero-jersey", { y: -10, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-chip-a", { y: -6, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3 });
      gsap.to(".hero-chip-b", { y: 6, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-scroll-dot", { y: 10, opacity: 0, duration: 1.4, repeat: -1, ease: "power1.in" });
      // Smoke puffs behind the jersey
      gsap.to(".hero-smoke", {
        x: "+=30",
        y: "-=20",
        scale: 1.15,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 1.5,
      });
    }, root);

    // Parallax exit on scroll
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (motionOff || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const pctx = gsap.context(() => {
        gsap.to(".hero-copy", {
          yPercent: -18,
          opacity: 0.2,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-visual", {
          yPercent: 12,
          scale: 0.94,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }, root);
      kill = () => pctx.revert();
    });

    return () => {
      ctx.revert();
      kill?.();
    };
  }, []);

  return (
    <section ref={root} className="relative w-full overflow-hidden pt-[var(--jt-header-h)]">
      <div className="relative z-10 jt-container">
        <div className="grid min-h-[calc(100svh-var(--jt-header-h))] items-center gap-6 pb-16 pt-6 sm:gap-8 sm:pb-20 sm:pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:pb-24 lg:pt-12 xl:gap-16">
          {/* Copy */}
          <div className="hero-copy order-2 flex flex-col justify-center lg:order-1">
            <p className="hero-fade inline-flex w-fit items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.3em] text-jt-neon">
              <span className="jt-pulse inline-block h-2 w-2 rounded-full bg-jt-neon shadow-[0_0_12px_rgba(180,255,26,0.9)]" />
              New season drop
              <span className="h-px w-5 bg-jt-neon/60" />
              Live now
            </p>

            <h1 className="mt-5 jt-display text-[clamp(2.6rem,5.6vw,5.1rem)] leading-[0.94] text-white drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)]">
              <span className="block overflow-hidden pb-[0.08em] pr-[0.1em]">
                <span className="hero-line jt-gradient-text-steel block">Premium</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em] pr-[0.1em]">
                <span className="hero-line jt-gradient-text-steel block">Jerseys for a</span>
              </span>
              <span className="block overflow-hidden pb-[0.08em] pr-[0.1em]">
                <span className="hero-line jt-gradient-text-fire block drop-shadow-[0_0_30px_rgba(255,122,26,0.45)]">
                  Bolder game.
                </span>
              </span>
            </h1>

            <p className="hero-fade mt-6 max-w-md text-sm leading-relaxed text-white/70 sm:text-base md:text-[17px]">
              Premium football jerseys and fanwear built for true supporters — from match day to the streets.
              Designed in the UAE. Shipped worldwide.
            </p>

            <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton href="/shop">
                Shop all jerseys <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              {featured && (
                <MagneticButton href={`/product/${featured.slug}`} variant="outline">
                  View featured
                </MagneticButton>
              )}
            </div>

            {/* Stats with icons + slash dividers */}
            <div className="hero-fade mt-9 grid grid-cols-3 border-t border-white/10 pt-6">
              {STATS.map(({ icon: Icon, value, label, color }, i) => (
                <div
                  key={label}
                  className="relative flex min-w-0 flex-col items-start gap-2 pr-2 sm:flex-row sm:items-center sm:gap-3"
                >
                  {i > 0 && (
                    <span
                      aria-hidden
                      className="absolute -left-3 top-1/2 hidden h-10 w-px -translate-y-1/2 -skew-x-[20deg] bg-gradient-to-b from-transparent via-white/30 to-transparent sm:-left-4 sm:block"
                    />
                  )}
                  <span className={`grid h-8 w-8 shrink-0 place-items-center jt-slant-sm bg-white/[0.06] sm:h-9 sm:w-9 ${color}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 leading-none">
                    <p className="jt-display text-lg text-white sm:text-xl xl:text-2xl">{value}</p>
                    <p className="mt-1 text-[9px] uppercase leading-tight tracking-[0.12em] text-jt-muted sm:text-[10px] sm:tracking-[0.18em]">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured jersey — slides one-by-one with a light 3D rotate */}
          <div className="hero-visual order-1 lg:order-2">
            {featured?.image ? (
              <div
                className="relative mx-auto w-full max-w-[280px] sm:max-w-[400px] lg:ml-auto lg:mr-0 lg:max-w-[480px]"
                style={{ perspective: "1100px" }}
                onPointerEnter={(e) => {
                  if (e.pointerType === "mouse") setPaused(true);
                }}
                onPointerLeave={() => setPaused(false)}
              >
                {/* Orange glow + smoke behind the frame */}
                <div className="pointer-events-none absolute left-1/2 top-[55%] h-[110%] w-[115%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.42),rgba(255,122,26,0.1)_45%,transparent_70%)] blur-3xl" />
                <div className="hero-smoke pointer-events-none absolute -bottom-[8%] -left-[20%] h-[55%] w-[70%] rounded-full bg-[radial-gradient(ellipse,rgba(255,160,90,0.35),transparent_65%)] blur-2xl" />
                <div className="hero-smoke pointer-events-none absolute -bottom-[12%] right-[-15%] h-[50%] w-[60%] rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.18),transparent_65%)] blur-2xl" />
                <div className="pointer-events-none absolute -right-[12%] top-[8%] h-[45%] w-[45%] rounded-full bg-[radial-gradient(circle,rgba(46,230,255,0.28),transparent_65%)] blur-3xl" />

                {/* Floating chips */}
                <div className="hero-chip hero-chip-a absolute left-3 top-4 z-30 hidden items-center gap-2 rounded-full border border-jt-amber/40 bg-jt-black/80 px-3 py-2 text-xs shadow-[0_10px_30px_-10px_rgba(255,176,32,0.6)] backdrop-blur-md sm:flex lg:-left-6">
                  <Star className="h-3.5 w-3.5 fill-jt-amber text-jt-amber" />
                  <span className="font-semibold">4.9 Fan Favourite</span>
                </div>
                <div className="hero-chip hero-chip-b absolute -right-2 bottom-[22%] z-30 hidden items-center gap-2 rounded-full border border-jt-neon/60 bg-jt-neon px-3 py-2 text-xs font-bold text-jt-black shadow-[0_10px_30px_-8px_rgba(180,255,26,0.8)] sm:flex lg:-right-6">
                  <PenLine className="h-3.5 w-3.5" />
                  Personalise name &amp; number
                </div>

                <div className="hero-jersey relative jt-drop-orange" style={{ transformStyle: "preserve-3d" }}>
                  <AnimatePresence mode="wait" custom={dir}>
                    <motion.div
                      key={featured.id}
                      custom={dir}
                      variants={slide3d}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ type: "spring", stiffness: 140, damping: 22, mass: 0.9 }}
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      <Link href={`/product/${featured.slug}`} className="group relative block">
                        <div className="jt-chamfer relative bg-[linear-gradient(135deg,rgba(46,230,255,0.9),rgba(255,255,255,0.35)_30%,rgba(255,122,26,0.9)_65%,rgba(255,176,32,0.9))] p-[2px]">
                          <div className="jt-chamfer relative overflow-hidden bg-jt-dark">
                            <div className="relative aspect-[4/5]">
                              <Image
                                src={featured.image.src}
                                alt={featured.image.alt || featured.name}
                                fill
                                priority={index === 0}
                                sizes="(max-width:1024px) 90vw, 40vw"
                                className="object-cover transition duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
                              />
                              <div className="pointer-events-none absolute -left-[30%] top-[20%] h-[3px] w-[160%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.9),transparent)] opacity-70 blur-[1px]" />
                              <div className="pointer-events-none absolute -left-[30%] top-[70%] h-[4px] w-[160%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.9),transparent)] opacity-70 blur-[1.5px]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-jt-black via-jt-black/15 to-transparent" />
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,122,26,0.35),transparent_60%)]" />
                              <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
                            </div>

                            <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-6">
                              <div className="min-w-0 flex-1">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-jt-orange">
                                  Featured jersey
                                </p>
                                <h2 className="mt-1.5 line-clamp-2 break-words jt-display text-xl leading-[0.95] text-white sm:text-2xl md:text-3xl">
                                  {featured.name}
                                </h2>
                              </div>
                              <div className="w-fit shrink-0 jt-slant bg-jt-black/90 px-4 py-2 text-left ring-1 ring-white/10 sm:text-right">
                                <p className="text-[9px] uppercase tracking-[0.2em] text-jt-muted">From</p>
                                <p className="jt-display text-lg text-white sm:text-xl">{formatAED(featured.price)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </AnimatePresence>
                </div>

              </div>
            ) : (
              <div className="jt-chamfer mx-auto aspect-[4/5] w-full max-w-[400px] bg-jt-surface lg:ml-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Progress dots sit in reserved bottom space (not over copy/stats) */}
      {products.length > 1 && (
        <div className="hero-fade pointer-events-none absolute inset-x-0 bottom-4 z-20 flex flex-col items-center gap-2 sm:bottom-6">
          <div className="pointer-events-auto">
            <ProgressDots
              size="hero"
              count={products.length}
              index={index}
              durationMs={HERO_SLIDE_MS}
              paused={paused || !!reduced}
              labels={products.map((p) => p.name)}
              onSelect={(i) => {
                setDir(i > index ? 1 : -1);
                setIndex(i);
              }}
            />
          </div>
          <div className="pointer-events-none hidden items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-jt-muted md:flex">
            Scroll
            <ChevronDown className="hero-scroll-dot h-3.5 w-3.5 text-jt-orange" />
          </div>
        </div>
      )}
    </section>
  );
}
