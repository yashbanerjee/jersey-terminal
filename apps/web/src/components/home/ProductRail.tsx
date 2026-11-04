"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/woo/types";
import { HoverScramble } from "@/components/motion/HoverScramble";
import { JerseySlider } from "@/components/motion/JerseySlider";
import { Reveal } from "@/components/motion/Reveal";
import { ScrollParallax } from "@/components/motion/ScrollParallax";
import { SectionScan } from "@/components/motion/SectionScan";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { ProductGrid } from "@/components/product/ProductGrid";

export function ProductRail({
  title,
  subtitle,
  eyebrow,
  products,
  href,
  index,
  layout = "grid",
  limit = 8,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: ProductCardModel[];
  href?: string;
  index?: number;
  /** `deck` = 3D coverflow; `grid` = dense product tiles (default). */
  layout?: "deck" | "grid" | "deck+grid";
  limit?: number;
}) {
  const even = (index ?? 0) % 2 === 0;
  const shown = products.slice(0, limit);
  const countLabel = products.length ? `${products.length} styles` : null;

  return (
    <section className="relative w-full overflow-x-hidden py-6 sm:py-8 md:py-10">
      <SectionScan />
      <ScrollParallax
        distance={80}
        xDistance={even ? 40 : -40}
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div
          aria-hidden
          className={`jt-blob ${even ? "jt-blob-orange -right-[10%]" : "jt-blob-cyan -left-[10%]"} top-0 h-[42vh] w-[48vw] opacity-55`}
        />
      </ScrollParallax>
      <ScrollParallax distance={40} xDistance={even ? -30 : 30} className="pointer-events-none absolute inset-0 -z-10">
        <div
          aria-hidden
          className={`absolute left-[-20%] h-[2px] w-[140%] -rotate-[22deg] blur-[1px] ${
            even
              ? "top-[40%] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.5),transparent)]"
              : "top-[60%] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.45),transparent)]"
          }`}
        />
      </ScrollParallax>

      <div className="jt-container">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
          <div className="min-w-0 flex-1">
            <Reveal effect="left" y={20} idle="float">
              <p className="mb-1.5 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-jt-neon">
                {index !== undefined && (
                  <span className="jt-gradient-text-fire jt-display text-lg tracking-[0.15em]">
                    {String(index).padStart(2, "0")}
                  </span>
                )}
                <span className="h-px w-8 bg-gradient-to-r from-jt-neon to-transparent" />
                <HoverScramble text={(eyebrow ?? "Collection").toUpperCase()} />
                {countLabel && (
                  <span className="rounded-full border border-white/15 bg-white/[0.04] px-2.5 py-1 text-[10px] tracking-[0.18em] text-white/65">
                    {countLabel}
                  </span>
                )}
              </p>
            </Reveal>
            <SplitHeading
              text={title}
              accentWords={[title.split(" ").length]}
              className="jt-display text-[clamp(1.85rem,6.5vw,3.1rem)] leading-[0.95] sm:text-4xl md:text-5xl"
            />
            {subtitle && (
              <Reveal y={20} delay={0.12} idle="breathe">
                <p className="mt-1.5 max-w-xl text-pretty text-sm text-jt-muted sm:text-[15px]">{subtitle}</p>
              </Reveal>
            )}
          </div>
          {href && (
            <Reveal effect="right" y={20} delay={0.15} idle="pulse" className="shrink-0 self-start sm:self-end">
              <Link
                href={href}
                className="group jt-slant inline-flex bg-white/30 p-px transition-colors hover:bg-jt-orange"
              >
                <span className="jt-slant inline-flex items-center gap-2 bg-jt-black/85 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-colors group-hover:text-jt-amber sm:px-5 sm:text-xs">
                  View all
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>

        {!products.length ? (
          <p className="text-sm text-jt-muted">Connect WooCommerce to load live products for this collection.</p>
        ) : (
          <>
            {(layout === "deck" || layout === "deck+grid") && (
              <Reveal effect="3d" y={40} delay={0.06} className="mb-6 sm:mb-8">
                <JerseySlider products={shown} />
              </Reveal>
            )}
            {(layout === "grid" || layout === "deck+grid") && (
              <Reveal effect="3d" y={36} delay={layout === "deck+grid" ? 0.12 : 0.06}>
                <ProductGrid
                  products={layout === "deck+grid" ? products.slice(0, Math.max(limit, 8)) : shown}
                />
              </Reveal>
            )}
          </>
        )}
      </div>
    </section>
  );
}
