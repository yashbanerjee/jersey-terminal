"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, ChevronDown, Globe, PenLine, Shirt, Star, Zap } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { HeroAmbientVideo } from "@/components/motion/HeroAmbientVideo";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { ProgressDots } from "@/components/motion/ProgressDots";
import { formatAED } from "@/lib/format";

const HERO_SLIDE_MS = 4200;

const MATCH_LIFE = [
  "/products/united-tigers/match-life-01.webp",
  "/products/united-tigers/match-life-02.webp",
  "/products/united-tigers/match-life-03.webp",
  "/products/united-tigers/match-life-04.webp",
];

export type HeroProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  image?: { src: string; alt: string };
  badges?: Array<"new" | "bestseller" | "limited" | "sale">;
  category?: string;
};

type HeroSlide = HeroProduct & { slideKey: string };

const STATS = [
  { icon: Shirt, value: "UT", label: "Match + training", color: "text-jt-cyan" },
  { icon: Zap, value: "1–3 days", label: "UAE delivery", color: "text-jt-orange" },
  { icon: Globe, value: "15+", label: "Custom kit MOQ", color: "text-jt-cyan" },
];

/** Expand match jersey into lifestyle shots so the hero always has a lively carousel. */
function buildSlides(products: HeroProduct[]): HeroSlide[] {
  const slides: HeroSlide[] = [];
  for (const p of products) {
    if (p.slug === "united-tiger-match-jersey") {
      for (const [i, src] of MATCH_LIFE.entries()) {
        slides.push({
          ...p,
          slideKey: `match-life-${i}`,
          image: { src, alt: p.image?.alt || p.name },
        });
      }
      continue;
    }
    if (p.image) {
      slides.push({ ...p, slideKey: `product-${p.id}` });
    }
  }
  if (!slides.length && products[0]) {
    slides.push({
      ...products[0],
      slideKey: "fallback-0",
      image: products[0].image ?? { src: MATCH_LIFE[0], alt: products[0].name },
    });
  }
  return slides;
}

const kitEase = [0.22, 1, 0.36, 1] as const;

const kitDeal = {
  enter: (dir: number) => ({
    x: dir > 0 ? 64 : -64,
    rotateY: dir > 0 ? -18 : 18,
    scale: 0.94,
    opacity: 0,
  }),
  center: {
    x: 0,
    rotateY: 0,
    scale: 1,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -48 : 48,
    rotateY: dir > 0 ? 14 : -14,
    scale: 0.96,
    opacity: 0,
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
  const slides = useMemo(() => buildSlides(products), [products]);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const featured = slides[index] ?? slides[0];
  const total = slides.length;

  const goTo = useCallback(
    (next: number, direction?: number) => {
      if (!total) return;
      const normalized = ((next % total) + total) % total;
      setDir(direction ?? (normalized > index || (index === total - 1 && normalized === 0) ? 1 : -1));
      setIndex(normalized);
    },
    [index, total],
  );

  // Reliable autoplay — timeout chain resets cleanly after every slide / pause change.
  useEffect(() => {
    if (reduced || paused || total < 2) return;
    const id = window.setTimeout(() => {
      setDir(1);
      setIndex((i) => (i + 1) % total);
    }, HERO_SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [index, paused, reduced, total]);

  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") setPaused(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const id = window.requestAnimationFrame(() => {
      el.classList.add("is-booted");
      window.dispatchEvent(new CustomEvent("jt:booted"));
    });
    return () => window.cancelAnimationFrame(id);
  }, []);

  // Keep index in range if slide list shrinks.
  useEffect(() => {
    if (index >= total && total > 0) setIndex(0);
  }, [index, total]);

  return (
    <section
      ref={root}
      className="jt-hero-ready relative flex min-h-[100svh] w-full flex-col overflow-hidden pt-[var(--jt-header-h)]"
    >
      <HeroAmbientVideo />

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

            <div className="hero-visual order-1 flex min-h-0 flex-col lg:order-2">
              {featured?.image ? (
                <div className="relative flex min-h-0 flex-1 flex-col" style={{ perspective: "1400px" }}>
                  <div className="pointer-events-none absolute left-1/2 top-[48%] h-[95%] w-[120%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,122,26,0.45),rgba(46,230,255,0.12)_42%,transparent_68%)] blur-3xl" />
                  <div className="hero-smoke pointer-events-none absolute -bottom-[6%] -left-[12%] h-[50%] w-[65%] rounded-full bg-[radial-gradient(ellipse,rgba(255,160,90,0.4),transparent_65%)] blur-2xl" />
                  <div className="hero-smoke pointer-events-none absolute -bottom-[8%] right-[-10%] h-[45%] w-[55%] rounded-full bg-[radial-gradient(ellipse,rgba(255,255,255,0.16),transparent_65%)] blur-2xl" />
                  <div className="pointer-events-none absolute -right-[8%] top-[6%] h-[40%] w-[42%] rounded-full bg-[radial-gradient(circle,rgba(46,230,255,0.32),transparent_65%)] blur-3xl" />

                  <div className="hero-jersey relative mx-auto w-full max-w-[min(100%,calc(66svh*0.75))]">
                    {/* Neon slash on every swap */}
                    <AnimatePresence>
                      <motion.span
                        key={`slash-${featured.slideKey}`}
                        aria-hidden
                        className="pointer-events-none absolute inset-y-[-6%] left-[-25%] z-30 w-[30%] -skew-x-[22deg] bg-[linear-gradient(90deg,transparent,rgba(180,255,26,0.5),rgba(255,122,26,0.4),transparent)] mix-blend-screen"
                        initial={{ x: "-30%", opacity: 0 }}
                        animate={
                          reduced
                            ? { opacity: 0 }
                            : { x: ["-30%", "380%"], opacity: [0, 1, 1, 0] }
                        }
                        transition={{ duration: 0.75, ease: kitEase, times: [0, 0.15, 0.7, 1] }}
                      />
                    </AnimatePresence>

                    <div
                      className="relative aspect-[3/4] w-full overflow-visible"
                      style={{ transformStyle: "preserve-3d", perspective: "1400px" }}
                    >
                      <AnimatePresence initial={false} custom={dir} mode="sync">
                        <motion.div
                          key={featured.slideKey}
                          custom={dir}
                          variants={reduced ? undefined : kitDeal}
                          initial={reduced ? { opacity: 0 } : "enter"}
                          animate={reduced ? { opacity: 1 } : "center"}
                          exit={reduced ? { opacity: 0 } : "exit"}
                          transition={
                            reduced
                              ? { duration: 0.3 }
                              : {
                                  x: { type: "spring", stiffness: 120, damping: 20, mass: 0.7 },
                                  rotateY: { type: "spring", stiffness: 110, damping: 18, mass: 0.75 },
                                  scale: { type: "spring", stiffness: 140, damping: 18 },
                                  opacity: { duration: 0.4, ease: kitEase },
                                }
                          }
                          className="absolute inset-0"
                          style={{ transformStyle: "preserve-3d", transformOrigin: "50% 55%" }}
                        >
                          {/* Idle float keeps the hero feeling alive between swaps */}
                          <motion.div
                            className="h-full"
                            animate={
                              reduced
                                ? undefined
                                : { y: [0, -8, 0], rotateZ: [0, 0.6, 0] }
                            }
                            transition={
                              reduced
                                ? undefined
                                : { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
                            }
                          >
                            <Link href={`/product/${featured.slug}`} className="group relative block h-full">
                              <div className="jt-chamfer relative h-full bg-[linear-gradient(135deg,rgba(46,230,255,0.95),rgba(255,255,255,0.4)_28%,rgba(255,122,26,0.95)_62%,rgba(255,176,32,0.95))] p-[2px] shadow-[0_40px_100px_-24px_rgba(255,122,26,0.65)]">
                                <div className="jt-chamfer relative h-full overflow-hidden bg-[radial-gradient(ellipse_at_50%_70%,#3b0a4a_0%,#12061a_55%,#050607_100%)]">
                                  <div className="relative h-full w-full">
                                    <motion.div
                                      className="absolute inset-0"
                                      initial={reduced ? false : { scale: 1.06 }}
                                      animate={{ scale: 1 }}
                                      transition={{ duration: 1.1, ease: kitEase }}
                                    >
                                      <Image
                                        src={featured.image.src}
                                        alt={featured.image.alt || featured.name}
                                        fill
                                        priority
                                        quality={95}
                                        sizes="(max-width:1024px) 92vw, 42vw"
                                        className="!h-full !w-full !object-contain !object-center transition duration-700 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.03]"
                                      />
                                    </motion.div>
                                    <div className="absolute inset-0 bg-gradient-to-t from-jt-black/70 via-transparent to-transparent" />
                                    <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0 opacity-30" />

                                    <motion.div
                                      className="absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3 sm:p-4"
                                      initial={reduced ? false : { y: -12, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      transition={{ delay: 0.12, duration: 0.45, ease: kitEase }}
                                    >
                                      <div className="hero-chip hero-chip-a flex items-center gap-1.5 rounded-full border border-jt-amber/50 bg-gradient-to-r from-jt-black/85 to-jt-black/65 px-2.5 py-1.5 text-[11px] shadow-[0_10px_30px_-10px_rgba(255,176,32,0.75)] backdrop-blur-md sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
                                        <Star className="h-3.5 w-3.5 fill-jt-amber text-jt-amber" />
                                        <span className="font-semibold text-white">4.9 Fan Favourite</span>
                                      </div>
                                      <div className="flex flex-col items-end gap-1.5">
                                        <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 backdrop-blur">
                                          {String(index + 1).padStart(2, "0")} /{" "}
                                          {String(Math.max(total, 1)).padStart(2, "0")}
                                        </span>
                                        <span className="jt-gradient-bg-fire rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-jt-black">
                                          {badgeLabel(featured)}
                                        </span>
                                      </div>
                                    </motion.div>

                                    <motion.div
                                      className="absolute inset-x-0 bottom-0 z-20 flex flex-col gap-3 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-3.5 pt-16 sm:p-5 sm:pt-20"
                                      initial={reduced ? false : { y: 18, opacity: 0 }}
                                      animate={{ y: 0, opacity: 1 }}
                                      transition={{ delay: 0.18, duration: 0.5, ease: kitEase }}
                                    >
                                      <div className="min-w-0">
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
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="w-fit shrink-0 jt-slant bg-gradient-to-br from-jt-black to-jt-surface px-4 py-2 text-left ring-1 ring-white/15">
                                          <p className="text-[9px] uppercase tracking-[0.2em] text-jt-muted">From</p>
                                          <p className="jt-display text-lg sm:text-xl">
                                            <span className="jt-gradient-text-fire">{formatAED(featured.price)}</span>
                                          </p>
                                        </div>
                                        <span className="inline-flex max-w-[58%] items-center gap-1.5 rounded-full border border-jt-neon/70 bg-gradient-to-r from-jt-neon to-jt-lime px-2.5 py-1.5 text-[10px] font-bold leading-tight text-jt-black shadow-[0_10px_30px_-8px_rgba(180,255,26,0.9)] sm:max-w-none sm:gap-2 sm:px-3 sm:py-2 sm:text-xs">
                                          <PenLine className="h-3.5 w-3.5 shrink-0" />
                                          Personalise name &amp; number
                                        </span>
                                      </div>
                                    </motion.div>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        </motion.div>
                      </AnimatePresence>
                    </div>
                  </div>

                  {total > 1 && (
                    <div
                      className="mt-3 grid shrink-0 grid-cols-4 gap-2 sm:mt-3.5 sm:grid-cols-5 sm:gap-2.5"
                      onPointerEnter={() => setPaused(true)}
                      onPointerLeave={() => setPaused(false)}
                    >
                      {slides.slice(0, 5).map((p, i) => {
                        const active = i === index;
                        return (
                          <motion.button
                            key={p.slideKey}
                            type="button"
                            aria-label={`Show look ${i + 1}`}
                            aria-pressed={active}
                            onClick={() => goTo(i)}
                            whileHover={{ y: -2, scale: 1.04 }}
                            whileTap={{ scale: 0.95 }}
                            animate={{ opacity: active ? 1 : 0.62, scale: active ? 1.05 : 1 }}
                            transition={{ type: "spring", stiffness: 340, damping: 24 }}
                            className={`relative aspect-[3/4] overflow-hidden rounded-lg bg-[radial-gradient(ellipse_at_50%_70%,#3b0a4a_0%,#12061a_60%,#050607_100%)] ring-1 ${
                              active
                                ? "ring-jt-neon shadow-[0_0_18px_-4px_rgba(180,255,26,0.75)]"
                                : "ring-white/10"
                            }`}
                          >
                            {p.image ? (
                              <Image
                                src={p.image.src}
                                alt=""
                                fill
                                sizes="96px"
                                quality={90}
                                className="!h-full !w-full !object-contain !object-center"
                              />
                            ) : null}
                            <span
                              aria-hidden
                              className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent ${active ? "opacity-30" : "opacity-55"}`}
                            />
                          </motion.button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="jt-chamfer relative mx-auto aspect-[3/4] w-full max-w-[min(100%,calc(66svh*0.75))] overflow-hidden bg-[radial-gradient(ellipse_at_50%_70%,#3b0a4a_0%,#12061a_55%,#050607_100%)]">
                  <Image
                    src="/products/united-tigers/match-life-01.webp"
                    alt="United Tiger Match Jersey"
                    fill
                    priority
                    quality={95}
                    sizes="(max-width:1024px) 92vw, 42vw"
                    className="!object-contain !object-center"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {total > 1 && (
          <div className="hero-fade pointer-events-none relative z-20 flex shrink-0 flex-col items-center gap-1.5 pb-3 pt-1 sm:pb-4">
            <div
              className="pointer-events-auto"
              onPointerEnter={() => setPaused(true)}
              onPointerLeave={() => setPaused(false)}
            >
              <ProgressDots
                size="hero"
                count={total}
                index={index}
                durationMs={HERO_SLIDE_MS}
                paused={paused || !!reduced}
                labels={slides.map((p, i) => `${p.name} look ${i + 1}`)}
                onSelect={(i) => goTo(i)}
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
