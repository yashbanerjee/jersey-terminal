"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/woo/types";
import { JerseySlider } from "@/components/motion/JerseySlider";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export function ProductRail({
  title,
  subtitle,
  eyebrow,
  products,
  href,
  index,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  products: ProductCardModel[];
  href?: string;
  /** Optional section number shown as "01 / 02 / 03" */
  index?: number;
}) {
  const even = (index ?? 0) % 2 === 0;

  return (
    <section className="relative w-full overflow-x-hidden py-8 sm:py-10 md:py-14">
      <div
        aria-hidden
        className={`jt-blob ${even ? "jt-blob-orange -right-[10%]" : "jt-blob-cyan -left-[10%]"} top-0 -z-10 h-[50vh] w-[50vw] opacity-50`}
      />
      <div
        aria-hidden
        className={`pointer-events-none absolute left-[-20%] -z-10 h-[2px] w-[140%] -rotate-[22deg] blur-[1px] ${
          even
            ? "top-[40%] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.5),transparent)]"
            : "top-[60%] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.45),transparent)]"
        }`}
      />

      <div className="jt-container">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div className="min-w-0">
            <Reveal effect="left" y={16}>
              <p className="mb-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-jt-neon">
                {index !== undefined && (
                  <span className="jt-gradient-text-fire jt-display text-lg tracking-[0.15em]">
                    {String(index).padStart(2, "0")}
                  </span>
                )}
                <span className="h-px w-8 bg-gradient-to-r from-jt-neon to-transparent" />
                {eyebrow ?? "Collection"}
              </p>
            </Reveal>
            <SplitHeading
              text={title}
              accentWords={[title.split(" ").length]}
              className="jt-display text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
            />
            {subtitle && (
              <Reveal y={16} delay={0.12}>
                <p className="mt-2 max-w-md text-sm text-jt-muted sm:text-base">{subtitle}</p>
              </Reveal>
            )}
          </div>
          {href && (
            <Reveal effect="right" y={16} delay={0.15} className="shrink-0">
              <Link
                href={href}
                className="group jt-slant inline-flex bg-white/30 p-px transition-colors hover:bg-jt-orange"
              >
                <span className="jt-slant inline-flex items-center gap-2 bg-jt-black/85 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-colors group-hover:text-jt-amber sm:text-xs">
                  View all
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          )}
        </div>

        {products.length ? (
          <JerseySlider products={products} />
        ) : (
          <p className="text-sm text-jt-muted">Connect WooCommerce to load live products for this collection.</p>
        )}
      </div>
    </section>
  );
}
