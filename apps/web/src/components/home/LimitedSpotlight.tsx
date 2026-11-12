"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

/** Limited edition product block — static layout for smooth scrolling. */
export function LimitedSpotlight({ products, href }: { products: ProductCardModel[]; href: string }) {
  if (!products.length) return null;
  const items = products.slice(0, 8);

  return (
    <section className="relative w-full overflow-hidden py-7 sm:py-9 md:py-12">
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(115deg,rgba(180,255,26,0.1)_0%,rgba(5,6,7,0.2)_40%,rgba(180,255,26,0.08)_100%)]" />
      <div aria-hidden className="jt-blob jt-blob-orange -left-[10%] top-1/2 -z-10 h-[55vh] w-[45vw] -translate-y-1/2 opacity-70" />
      <div aria-hidden className="jt-blob jt-blob-cyan -right-[10%] bottom-0 -z-10 h-[40vh] w-[36vw] opacity-70" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-20%] top-[30%] -z-10 h-[3px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.7),transparent)] blur-[1px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-20%] top-[65%] -z-10 h-[2px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.6),transparent)] blur-[1px]"
      />
      <div
        aria-hidden
        className="ls-watermark jt-outline-text pointer-events-none absolute left-0 top-1/2 -z-10 -translate-y-1/2 whitespace-nowrap jt-display text-[16vw] leading-none select-none"
      >
        LIMITED EDITION LIMITED EDITION
      </div>

      <div className="jt-container">
        <div className="mb-4 flex flex-col gap-3 sm:mb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal effect="left" y={18} idle="float">
              <p className="mb-1.5 inline-flex items-center gap-2 jt-slant-sm bg-jt-orange/15 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-amber backdrop-blur">
                <span className="jt-pulse-orange inline-block h-1.5 w-1.5 rounded-full bg-jt-orange" />
                Limited edition · {items.length} live drops
              </p>
            </Reveal>
            <SplitHeading
              text="Own the rare ones"
              accentWords={[3, 4]}
              className="jt-display mt-1.5 text-[clamp(2rem,7vw,3.5rem)] leading-[0.92] sm:text-5xl md:text-6xl"
            />
          </div>
          <Reveal y={18} delay={0.2} idle="pulse" className="shrink-0 self-start md:self-end">
            <MagneticButton href={href} variant="outline">
              All limited drops <ArrowRight className="h-4 w-4" />
            </MagneticButton>
          </Reveal>
        </div>
      </div>

      <div className="ls-track jt-snap flex w-full gap-3 overflow-x-auto px-[var(--jt-pad-x)] pb-3 sm:gap-4">
        {items.map((p, i) => (
          <Reveal
            key={p.id}
            effect="3d"
            delay={i * 0.06}
            idle="sway"
            className="w-[62vw] shrink-0 sm:w-[38vw] md:w-[28vw] lg:w-[22vw] xl:w-[18vw]"
          >
            <Link
              href={`/product/${p.slug}`}
              className="jt-card jt-drop-orange group relative block bg-[linear-gradient(135deg,rgba(46,230,255,0.6),rgba(255,255,255,0.15)_35%,rgba(255,122,26,0.7))] p-px jt-chamfer transition-transform duration-500 hover:-translate-y-2"
            >
              <div className="jt-chamfer relative overflow-hidden bg-[radial-gradient(ellipse_at_50%_70%,#4a0d5c_0%,#1a0824_52%,#050607_100%)]">
                <div className="jt-card-media relative aspect-[4/5]">
                  {p.image ? (
                    <Image
                      src={p.image.src}
                      alt={p.image.alt}
                      fill
                      sizes="(max-width:640px) 62vw, (max-width:1024px) 28vw, 18vw"
                      className="!object-contain !object-center"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-jt-black/95 via-jt-black/25 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-br from-jt-orange/15 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
                  <span className="jt-gradient-text-fire absolute left-4 top-1.5 jt-display text-5xl opacity-80">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="absolute inset-x-0 bottom-0 flex flex-col gap-2 p-3.5 sm:flex-row sm:items-end sm:justify-between sm:gap-2 sm:p-4">
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-jt-orange">
                      <span className="h-1 w-1 rounded-full bg-jt-orange" />
                      Limited
                    </p>
                    <h3 className="mt-1 line-clamp-2 break-words jt-display text-base leading-[0.95] text-white sm:text-lg">
                      {p.name}
                    </h3>
                  </div>
                  <span className="jt-gradient-bg jt-slant-sm w-fit shrink-0 px-3 py-1.5 text-sm font-bold text-jt-black">
                    {formatAED(p.price)}
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
