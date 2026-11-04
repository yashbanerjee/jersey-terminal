"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight, ChevronDown, Star } from "lucide-react";
import { AnimatedGradientBg } from "@/components/motion/AnimatedGradientBg";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { formatAED } from "@/lib/format";

export type HeroProduct = {
  id: number;
  slug: string;
  name: string;
  price: string;
  image?: { src: string; alt: string };
};

export function Hero({ products = [] }: { products?: HeroProduct[] }) {
  const root = useRef<HTMLElement>(null);
  const featured = products[0];

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let kill: (() => void) | undefined;

    const ctx = gsap.context(() => {
      if (reduced) {
        gsap.set([".hero-line", ".hero-fade", ".hero-visual"], { opacity: 1, y: 0, x: 0, yPercent: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.fromTo(".hero-line", { yPercent: 110, rotate: 2 }, { yPercent: 0, rotate: 0, duration: 1.1, stagger: 0.12 }, 0.1)
        .fromTo(".hero-fade", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.1 }, 0.5)
        .fromTo(
          ".hero-visual",
          { opacity: 0, x: 60, scale: 0.94, rotate: 2 },
          { opacity: 1, x: 0, scale: 1, rotate: 0, duration: 1.3 },
          0.25,
        )
        .fromTo(".hero-chip", { opacity: 0, scale: 0.8, y: 10 }, { opacity: 1, scale: 1, y: 0, duration: 0.6, stagger: 0.12 }, 1);

      gsap.to(".hero-jersey", { y: -10, duration: 3.8, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-chip-a", { y: -6, duration: 2.8, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 0.3 });
      gsap.to(".hero-chip-b", { y: 6, duration: 3.2, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.to(".hero-scroll-dot", { y: 10, opacity: 0, duration: 1.4, repeat: -1, ease: "power1.in" });
    }, root);

    // Parallax exit on scroll
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      if (reduced || !root.current) return;
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
      <AnimatedGradientBg intensity="full" />

      <div className="relative z-10 jt-container">
        <div className="grid min-h-[calc(100svh-var(--jt-header-h))] items-center gap-6 py-6 sm:gap-8 sm:py-10 lg:grid-cols-[1fr_1fr] lg:gap-10 lg:py-12 xl:gap-16">
          {/* Copy */}
          <div className="hero-copy order-2 flex flex-col justify-center lg:order-1">
            <p className="hero-fade inline-flex w-fit items-center gap-2 rounded-full border border-jt-neon/30 bg-jt-neon/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon shadow-[0_0_30px_-8px_rgba(164,255,20,0.6)] backdrop-blur">
              <span className="jt-pulse inline-block h-1.5 w-1.5 rounded-full bg-jt-neon" />
              New season drops are live
            </p>

            <h1 className="mt-5 jt-display text-[clamp(3.75rem,10vw,8.25rem)] leading-[0.86] text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="hero-line block">GEAR UP.</span>
              </span>
              <span className="block overflow-hidden pb-[0.06em]">
                <span className="hero-line jt-gradient-text-aurora block">STAND OUT.</span>
              </span>
            </h1>

            <p className="hero-fade mt-5 max-w-md text-base leading-relaxed text-white/70 md:text-lg">
              Premium football jerseys and fanwear built for true supporters — from match day to the streets.
              Designed in the UAE. Shipped worldwide.
            </p>

            <div className="hero-fade mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton href="/shop" className="jt-btn-glow">
                Shop all jerseys <ArrowRight className="h-4 w-4" />
              </MagneticButton>
              {featured && (
                <MagneticButton href={`/product/${featured.slug}`} variant="outline">
                  View featured
                </MagneticButton>
              )}
            </div>

            <div className="hero-fade mt-8 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                ["6+", "Jersey styles"],
                ["1–3 days", "UAE delivery"],
                ["190+", "Countries shipped"],
              ].map(([v, l], i) => (
                <div key={l} className="group/stat">
                  <p
                    className={`jt-display text-2xl sm:text-3xl ${
                      i === 0 ? "jt-gradient-text" : i === 1 ? "text-jt-cyan" : "jt-gradient-text-violet"
                    }`}
                  >
                    {v}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-jt-muted sm:text-[11px]">{l}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured jersey */}
          <div className="hero-visual order-1 lg:order-2">
            {featured?.image ? (
              <Link
                href={`/product/${featured.slug}`}
                className="group relative mx-auto block w-full max-w-[270px] sm:max-w-[400px] lg:ml-auto lg:mr-0 lg:max-w-[500px]"
              >
                {/* Dual-tone glow halo */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[100%] w-[100%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(164,255,20,0.35),transparent_65%)] blur-3xl" />
                <div className="pointer-events-none absolute -right-[15%] top-[10%] h-[60%] w-[60%] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.45),transparent_65%)] blur-3xl" />
                <div className="pointer-events-none absolute -left-[15%] bottom-[5%] h-[50%] w-[50%] rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.3),transparent_65%)] blur-3xl" />

                {/* Floating chips */}
                <div className="hero-chip hero-chip-a absolute -left-3 top-8 z-20 hidden items-center gap-2 rounded-full border border-jt-lime/30 bg-jt-black/70 px-3 py-2 text-xs shadow-[0_10px_30px_-10px_rgba(233,255,58,0.5)] backdrop-blur-md sm:flex lg:-left-8">
                  <Star className="h-3.5 w-3.5 fill-jt-lime text-jt-lime" />
                  <span className="font-medium">4.9 · Fan favourite</span>
                </div>
                <div className="hero-chip hero-chip-b absolute -right-3 bottom-24 z-20 hidden rounded-full border border-jt-violet/50 bg-jt-violet/15 px-3 py-2 text-xs font-medium text-[#d8c8ff] shadow-[0_10px_30px_-10px_rgba(139,92,246,0.7)] backdrop-blur-md sm:block lg:-right-8">
                  Personalise name &amp; number
                </div>

                <div className="hero-jersey jt-glow-border relative overflow-hidden rounded-2xl bg-jt-dark ring-1 ring-white/10 shadow-[0_40px_120px_-30px_rgba(164,255,20,0.45),0_20px_80px_-30px_rgba(139,92,246,0.5)]">
                  <div className="relative aspect-[3/4]">
                    <Image
                      src={featured.image.src}
                      alt={featured.image.alt || featured.name}
                      fill
                      priority
                      sizes="(max-width:1024px) 90vw, 42vw"
                      className="object-cover transition duration-1000 ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.05]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-jt-black/90 via-jt-black/10 to-transparent" />
                    <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
                  </div>

                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 sm:p-6">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.24em] text-jt-neon">Featured jersey</p>
                      <h2 className="mt-1 jt-display text-3xl text-white sm:text-4xl">
                        {featured.name}
                      </h2>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-jt-muted">From</p>
                      <p className="jt-gradient-text jt-display text-2xl sm:text-3xl">{formatAED(featured.price)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="mx-auto aspect-[3/4] w-full max-w-[400px] rounded-2xl bg-jt-surface lg:ml-auto" />
            )}
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-fade pointer-events-none absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-[10px] uppercase tracking-[0.3em] text-jt-muted md:flex">
        Scroll
        <ChevronDown className="hero-scroll-dot h-4 w-4 text-jt-neon" />
      </div>
    </section>
  );
}
