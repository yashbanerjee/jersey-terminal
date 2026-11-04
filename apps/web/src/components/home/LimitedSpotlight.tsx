"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ArrowRight } from "lucide-react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { MagneticButton } from "@/components/motion/MagneticButton";

/**
 * Cinematic "Limited Edition" block: giant watermark text moves with scroll,
 * cards drift horizontally in opposite direction (parallax).
 */
export function LimitedSpotlight({ products, href }: { products: ProductCardModel[]; href: string }) {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let kill: (() => void) | undefined;
    import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".ls-watermark",
          { xPercent: 10 },
          {
            xPercent: -25,
            ease: "none",
            scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.6 },
          },
        );
        // Horizontal drift only on wide screens; on touch devices the row is a native swipe scroller.
        const mm = gsap.matchMedia();
        mm.add("(min-width: 1024px)", () => {
          gsap.fromTo(
            ".ls-track",
            { x: 60 },
            {
              x: -60,
              ease: "none",
              scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: 0.8 },
            },
          );
        });
      }, root);
      kill = () => ctx.revert();
    });
    return () => kill?.();
  }, []);

  if (!products.length) return null;
  const items = products.slice(0, 4);

  return (
    <section ref={root} className="relative w-full overflow-hidden py-10 sm:py-14 md:py-20">
      {/* Violet "premium" band */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent,rgba(91,33,182,0.22)_30%,rgba(139,92,246,0.16)_70%,transparent)]" />
      <div aria-hidden className="jt-blob jt-blob-violet -left-[10%] top-1/2 -z-10 h-[70vh] w-[50vw] -translate-y-1/2 opacity-80" />
      <div aria-hidden className="jt-blob jt-blob-cyan -right-[10%] bottom-0 -z-10 h-[50vh] w-[40vw] opacity-60" />
      <div
        aria-hidden
        className="ls-watermark jt-outline-text pointer-events-none absolute left-0 top-1/2 -z-10 -translate-y-1/2 whitespace-nowrap jt-display text-[28vw] leading-none select-none"
      >
        LIMITED EDITION LIMITED EDITION
      </div>

      <div className="jt-container">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal y={12}>
              <p className="mb-2 inline-flex items-center gap-2 rounded-full border border-jt-violet/40 bg-jt-violet/15 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-[#d8c8ff] shadow-[0_0_30px_-8px_rgba(139,92,246,0.7)] backdrop-blur">
                <span className="jt-pulse-violet inline-block h-1.5 w-1.5 rounded-full bg-jt-violet" />
                Limited edition · While stock lasts
              </p>
            </Reveal>
            <SplitHeading
              text="Own the rare ones"
              accentWords={[3, 4]}
              className="jt-display mt-2 text-5xl leading-[0.92] sm:text-6xl md:text-7xl"
            />
          </div>
          <Reveal y={12} delay={0.2}>
            <MagneticButton href={href} variant="outline">
              All limited drops <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="ls-track jt-snap flex w-full gap-4 overflow-x-auto px-[var(--jt-pad-x)] pb-4 sm:gap-5">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.08} className="w-[78vw] shrink-0 sm:w-[48vw] lg:w-[30vw] xl:w-[24vw]">
            <Link
              href={`/product/${p.slug}`}
              className="jt-card group relative block overflow-hidden rounded-2xl bg-jt-surface ring-1 ring-white/10 shadow-[0_30px_80px_-40px_rgba(139,92,246,0.6)]"
            >
              <div className="jt-card-media relative aspect-[4/5] rounded-2xl">
                {p.image ? (
                  <Image
                    src={p.image.src}
                    alt={p.image.alt}
                    fill
                    sizes="(max-width:640px) 80vw, (max-width:1024px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-jt-black/95 via-jt-black/25 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-br from-jt-violet/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
                <span aria-hidden className="jt-card-border pointer-events-none absolute inset-0 rounded-2xl" />
                <span className="jt-gradient-text-violet absolute left-4 top-3 jt-display text-6xl opacity-70">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8c8ff]">
                    <span className="h-1 w-1 rounded-full bg-jt-violet" />
                    Limited
                  </p>
                  <h3 className="mt-1 line-clamp-2 jt-display text-2xl leading-[0.95] text-white sm:text-3xl">
                    {p.name}
                  </h3>
                </div>
                <span className="jt-gradient-bg shrink-0 rounded-full px-3 py-1.5 text-sm font-bold text-jt-black shadow-[0_8px_24px_-8px_rgba(164,255,20,0.8)]">
                  {formatAED(p.price)}
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
