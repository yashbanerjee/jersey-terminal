"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowRight, ChevronDown, Globe, PenLine, Shirt, Star, Zap } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { HeroAmbientVideo } from "@/components/motion/HeroAmbientVideo";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProgressDots } from "@/components/motion/ProgressDots";
import { SlideImpact } from "@/components/motion/SlideImpact";
import { formatAED } from "@/lib/format";

const HERO_SLIDE_MS = 3000;

export type HeroProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  image?: { src: string; alt: string };
  badges?: Array<"new" | "bestseller" | "limited" | "sale">;
  category?: string;
};

const STATS = [
  { icon: Shirt, value: "6+", label: "Jersey styles", color: "text-jt-cyan" },
  { icon: Zap, value: "1–3 days", label: "UAE delivery", color: "text-jt-orange" },
  { icon: Globe, value: "190+", label: "Countries shipped", color: "text-jt-cyan" },
];

const slide3d = {
  enter: (dir: number) => ({
    x: dir > 0 ? 100 : -100,
    rotateY: dir > 0 ? -24 : 24,
    opacity: 0,
    scale: 0.9,
  }),
  center: { x: 0, rotateY: 0, opacity: 1, scale: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -100 : 100,
    rotateY: dir > 0 ? 24 : -24,
    opacity: 0,
    scale: 0.9,
  }),
};

function badgeLabel(p: HeroProduct) {
  if (p.badges?.[0] === "limited") return "Limited";
  if (p.badges?.[0] === "new") return "New drop";
  if (p.badges?.[0] === "sale") return "Sale";
  if (p.badges?.[0] === "bestseller") return "Featured";
  return p.category || "Featured";
}

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
    let booted = false;
    let fallbackTimer = 0;
    let playIntro: () => void = () => {};

    const ctx = gsap.context(() => {
      if (motionOff) {
        gsap.set([".hero-line", ".hero-fade", ".hero-visual", ".hero-chip"], { opacity: 1, y: 0, x: 0, yPercent: 0 });
        return;
      }

      gsap.set(".hero-line", { yPercent: 120, skewX: -10 });
      gsap.set(".hero-fade", { opacity: 0, y: 28 });
      gsap.set(".hero-visual", { opacity: 0, x: 90, scale: 0.9, rotate: 4 });
      gsap.set(".hero-chip", { opacity: 0, scale: 0.8, y: 14 });

      playIntro = () => {
        if (booted) return;
        booted = true;
        window.clearTimeout(fallbackTimer);

        const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
        tl.to(".hero-line", { yPercent: 0, skewX: 0, duration: 1.15, stagger: 0.1 }, 0.05)
          .to(".hero-fade", { opacity: 1, y: 0, duration: 0.75, stagger: 0.09 }, 0.4)
          .to(".hero-visual", { opacity: 1, x: 0, scale: 1, rotate: 0, duration: 1.25 }, 0.12)
          .to(".hero-chip", { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.85);

        gsap.to(".hero-jersey", { y: -8, duration: 3.6, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".hero-chip-a", { y: -5, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3 });
        gsap.to(".hero-chip-b", { y: 5, duration: 3.1, repeat: -1, yoyo: true, ease: "sine.inOut" });
        gsap.to(".hero-scroll-dot", { y: 10, opacity: 0, duration: 1.4, repeat: -1, ease: "power1.in" });
        gsap.to(".hero-smoke", {
          x: "+=24",
          y: "-=16",
          scale: 1.12,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          stagger: 1.4,
        });
      };

      window.addEventListener("jt:booted", playIntro, { once: true });
      fallbackTimer = window.setTimeout(playIntro, 3400);
    }, root);

    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (motionOff || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      const pctx = gsap.context(() => {
        gsap.to(".hero-copy", {
          yPercent: -12,
          opacity: 0.25,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-visual", {
          yPercent: 8,
          scale: 0.96,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }, root);
      kill = () => pctx.revert();
    });

    return () => {
      window.removeEventListener("jt:booted", playIntro);
      window.clearTimeout(fallbackTimer);
      ctx.revert();
      kill?.();
    };
  }, []);

  return (
    <section
      ref={root}
      className="relative flex min-h-[100svh] w-full flex-col overflow-hidden pt-[var(--jt-header-h)]"
    >
      <HeroAmbientVideo />

      {/* Full-bleed gradient atmosphere bridging copy + image */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(ellipse_at_18%_40%,rgba(180,255,26,0.16),transparent_42%),radial-gradient(ellipse_at_82%_35%,rgba(255,122,26,0.28),transparent_48%),radial-gradient(ellipse_at_70%_85%,rgba(46,230,255,0.14),transparent_45%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-[18%] left-[42%] z-[1] hidden w-[28%] -skew-x-[18deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.18),rgba(46,230,255,0.12),transparent)] blur-2xl lg:block"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="jt-container flex min-h-0 flex-1 flex-col py-4 sm:py-5 lg:py-6">
          <div className="grid min-h-0 flex-1 items-stretch gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-2 xl:gap-3">
            {/* Copy column — fills height */}
            <div className="hero-copy order-2 flex min-h-0 flex-col justify-center lg:order-1 lg:pr-2">
              <p className="hero-fade inline-flex w-fit items-center gap-2.5 rounded-full border border-jt-neon/35 bg-jt-neon/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon shadow-[0_0_24px_-8px_rgba(180,255,26,0.7)]">
                <span className="jt-pulse inline-block h-2 w-2 rounded-full bg-jt-neon shadow-[0_0_12px_rgba(180,255,26,0.9)]" />
                New season drop
                <span className="h-px w-4 bg-jt-neon/55" />
                Live now
              </p>

              <h1 className="mt-4 jt-display text-[clamp(2.55rem,6.2vw,5.4rem)] leading-[0.9] drop-shadow-[0_12px_40px_rgba(0,0,0,0.7)] sm:mt-5">
                <span className="block overflow-hidden pb-[0.06em] pr-[0.06em]">
                  <span className="hero-line jt-gradient-text-steel block">Premium</span>
                </span>
                <span className="block overflow-hidden pb-[0.06em] pr-[0.06em]">
                  <span className="hero-line jt-gradient-text-aurora block">Jerseys for a</span>
                </span>
                <span className="block overflow-hidden pb-[0.06em] pr-[0.06em]">
                  <span className="hero-line jt-gradient-text-fire relative block drop-shadow-[0_0_34px_rgba(255,122,26,0.5)]">
                    Bolder game.
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-[0.18em] w-[92%] bg-[linear-gradient(90deg,rgba(255,94,0,0.95),rgba(255,176,32,0.85),transparent)] opacity-90"
                      style={{ clipPath: "polygon(0 40%, 100% 0, 100% 100%, 0 100%)" }}
                    />
                  </span>
                </span>
              </h1>

              <p className="hero-fade mt-4 max-w-lg text-sm leading-relaxed text-white/75 sm:mt-5 sm:text-[15px] md:text-base">
                Premium football jerseys and fanwear built for true supporters — from match day to the streets.
                Designed in the UAE. Shipped worldwide.
              </p>

              <div className="hero-fade mt-5 flex flex-col gap-3 sm:mt-6 sm:flex-row sm:items-center">
                <MagneticButton href="/shop">
                  Shop all jerseys <ArrowRight className="h-4 w-4" />
                </MagneticButton>
                {featured && (
                  <MagneticButton href={`/product/${featured.slug}`} variant="outline">
                    View featured
                  </MagneticButton>
                )}
              </div>

              <div className="hero-fade mt-6 grid grid-cols-3 gap-2 border-t border-white/10 pt-4 sm:mt-7 sm:gap-3 sm:pt-5">
                {STATS.map(({ icon: Icon, value, label, color }, i) => (
                  <div
                    key={label}
                    className="relative flex min-w-0 flex-col items-start gap-2 rounded-xl border border-white/8 bg-gradient-to-br from-white/[0.06] to-transparent p-2.5 sm:flex-row sm:items-center sm:gap-3 sm:p-3"
                  >
                    {i > 0 && (
                      <span
                        aria-hidden
                        className="absolute -left-1.5 top-1/2 hidden h-8 w-px -translate-y-1/2 -skew-x-[20deg] bg-gradient-to-b from-transparent via-white/25 to-transparent lg:block"
                      />
                    )}
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center jt-slant-sm bg-gradient-to-br from-white/10 to-white/[0.02] sm:h-9 sm:w-9 ${color}`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                    </span>
                    <div className="min-w-0 leading-none">
                      <p className="jt-display text-base text-white sm:text-lg xl:text-xl">
                        <CountUp value={value} />
                      </p>
                      <p className="mt-1 text-[8px] uppercase leading-tight tracking-[0.12em] text-jt-muted sm:text-[10px] sm:tracking-[0.16em]">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual column — fills remaining viewport height */}
            <div className="hero-visual order-1 flex min-h-0 flex-col lg:order-2">
              {featured?.image ? (
                <div
                  className="relative flex min-h-0 flex-1 flex-col"
                  style={{ perspective: "1200px" }}
                  onPointerEnter={(e) => {
                    if (e.pointerType === "mouse") setPaused(true);
                  }}
                  onPointerLeave={() => setPaused(false)}
                >
                  <div className="pointer-events-none absolute left-1/2 top-[48%] h-[95%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.45),rgba(46,230,255,0.12)_42%,transparent_68%)] blur-3xl" />
                  <div className="hero-smoke pointer-events-none absolute -bottom-[6%] -left-[12%] h-[50%] w-[65%] rounded-full bg-[radial-gradient(ellipse,rgba(255,160,90,0.4),transparent_65%)] blur-2xl" />
                  <div className="hero-smoke pointer-events-none absolute -bottom-[8%] right-[-10%] h-[45%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.16),transparent_65%)] blur-2xl" />
                  <div className="pointer-events-none absolute -right-[8%] top-[6%] h-[40%] w-[42%] rounded-full bg-[radial-gradient(circle,rgba(46,230,255,0.32),transparent_65%)] blur-3xl" />

                  <div
                    className="hero-jersey relative mx-auto w-full max-w-[min(100%,calc(66svh*0.75))]"
                    style={{ transformStyle: "preserve-3d" }}
                  >
                    <SlideImpact triggerKey={featured.id} />
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
                          <div className="jt-chamfer relative bg-[linear-gradient(135deg,rgba(46,230,255,0.95),rgba(255,255,255,0.4)_28%,rgba(255,122,26,0.95)_62%,rgba(255,176,32,0.95))] p-[2px] shadow-[0_40px_100px_-24px_rgba(255,122,26,0.65)]">
                            <div className="jt-chamfer relative overflow-hidden bg-jt-dark">
                              {/* True portrait box — width capped so aspect never collapses into a wide stretch */}
                              <div className="relative aspect-[3/4] w-full">
                                <Image
                                  src={featured.image.src}
                                  alt={featured.image.alt || featured.name}
                                  fill
                                  priority={index === 0}
                                  sizes="(max-width:1024px) 92vw, 42vw"
                                  className="!h-full !w-full object-cover object-[center_18%] transition duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.04]"
                                />
                                <div className="pointer-events-none absolute -left-[30%] top-[18%] h-[3px] w-[160%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.95),transparent)] opacity-80 blur-[1px]" />
                                <div className="pointer-events-none absolute -left-[30%] top-[68%] h-[4px] w-[160%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.95),transparent)] opacity-80 blur-[1.5px]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-jt-black via-jt-black/25 to-transparent" />
                                <div className="absolute inset-x-0 bottom-0 h-[55%] bg-[radial-gradient(ellipse_at_50%_100%,rgba(255,122,26,0.4),transparent_62%)]" />
                                <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(46,230,255,0.12),transparent_35%,rgba(255,122,26,0.1)_70%,transparent)]" />
                                <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />

                                <div className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 sm:p-4">
                                  <div className="hero-chip hero-chip-a flex items-center gap-1.5 rounded-full border border-jt-amber/50 bg-gradient-to-r from-jt-black/85 to-jt-black/65 px-2.5 py-1.5 text-[11px] shadow-[0_10px_30px_-10px_rgba(255,176,32,0.75)] backdrop-blur-md sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
                                    <Star className="h-3.5 w-3.5 fill-jt-amber text-jt-amber" />
                                    <span className="font-semibold text-white">4.9 Fan Favourite</span>
                                  </div>
                                  <div className="flex flex-col items-end gap-1.5">
                                    <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                                      {String(index + 1).padStart(2, "0")} /{" "}
                                      {String(Math.max(products.length, 1)).padStart(2, "0")}
                                    </span>
                                    <span className="jt-gradient-bg-fire rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-jt-black">
                                      {badgeLabel(featured)}
                                    </span>
                                  </div>
                                </div>

                                <div className="hero-chip hero-chip-b absolute right-3 top-[40%] z-20 sm:right-4">
                                  <span className="inline-flex items-center gap-1.5 rounded-full border border-jt-neon/70 bg-gradient-to-r from-jt-neon to-jt-lime px-2.5 py-1.5 text-[10px] font-bold text-jt-black shadow-[0_10px_30px_-8px_rgba(180,255,26,0.9)] sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
                                    <PenLine className="h-3.5 w-3.5" />
                                    Personalise name &amp; number
                                  </span>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3.5 pt-16 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-5 sm:pt-20">
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-jt-orange">
                                      Featured jersey
                                      {featured.category ? (
                                        <span className="text-white/40"> · {featured.category}</span>
                                      ) : null}
                                    </p>
                                    <h2 className="mt-1.5 line-clamp-2 break-words jt-display text-xl leading-[0.95] sm:text-2xl md:text-3xl">
                                      <span className="jt-gradient-text-steel">{featured.name}</span>
                                    </h2>
                                    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-white/55">
                                      <span>Match-day cut</span>
                                      <span className="text-white/25">·</span>
                                      <span>UAE print</span>
                                      <span className="text-white/25">·</span>
                                      <span>Ships worldwide</span>
                                    </p>
                                  </div>
                                  <div className="w-fit shrink-0 jt-slant bg-gradient-to-br from-jt-black to-jt-surface px-4 py-2 text-left ring-1 ring-white/15 sm:text-right">
                                    <p className="text-[9px] uppercase tracking-[0.2em] text-jt-muted">From</p>
                                    <p className="jt-display text-lg sm:text-xl">
                                      <span className="jt-gradient-text-fire">{formatAED(featured.price)}</span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {products.length > 1 && (
                    <div className="mt-3 grid shrink-0 grid-cols-4 gap-2 sm:mt-3.5 sm:grid-cols-6 sm:gap-2.5">
                      {products.slice(0, 6).map((p, i) => (
                        <button
                          key={p.id}
                          type="button"
                          aria-label={`Show ${p.name}`}
                          onClick={() => {
                            setDir(i > index ? 1 : -1);
                            setIndex(i);
                          }}
                          className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-jt-surface ring-1 transition ${
                            i === index
                              ? "ring-jt-neon shadow-[0_0_18px_-4px_rgba(180,255,26,0.75)]"
                              : "ring-white/10 opacity-70 hover:opacity-100"
                          }`}
                        >
                          {p.image ? (
                            <Image
                              src={p.image.src}
                              alt=""
                              fill
                              sizes="96px"
                              className="!h-full !w-full object-cover object-[center_20%]"
                            />
                          ) : null}
                          <span
                            aria-hidden
                            className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent ${i === index ? "opacity-40" : "opacity-60"}`}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="jt-chamfer mx-auto aspect-[3/4] w-full max-w-[min(100%,calc(66svh*0.75))] bg-jt-surface" />
              )}
            </div>
          </div>
        </div>

        {products.length > 1 && (
          <div className="hero-fade pointer-events-none relative z-20 flex shrink-0 flex-col items-center gap-1.5 pb-3 pt-1 sm:pb-4">
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
      </div>
    </section>
  );
}
