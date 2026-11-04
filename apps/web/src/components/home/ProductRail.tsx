import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ProductCardModel } from "@/lib/woo/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
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
    <section className="relative w-full overflow-hidden py-8 sm:py-10 md:py-14">
      {/* Ambient colour blob — alternates side & hue per section */}
      <div
        aria-hidden
        className={`jt-blob ${even ? "jt-blob-violet -right-[10%]" : "jt-blob-lime -left-[10%]"} top-0 -z-10 h-[50vh] w-[50vw] opacity-60`}
      />

      <div className="jt-container">
        <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
          <div className="min-w-0">
            <Reveal y={12}>
              <p className="mb-2 flex items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-jt-neon">
                {index !== undefined && (
                  <span className="jt-gradient-text-violet jt-display text-lg tracking-[0.15em]">
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
              <Reveal y={12} delay={0.15}>
                <p className="mt-2 max-w-md text-sm text-jt-muted sm:text-base">{subtitle}</p>
              </Reveal>
            )}
          </div>
          {href && (
            <Reveal y={12} delay={0.2} className="shrink-0">
              <Link
                href={href}
                className="group inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/[0.03] px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur transition-all hover:border-jt-neon hover:bg-jt-neon/10 hover:text-jt-neon hover:shadow-[0_10px_30px_-12px_rgba(164,255,20,0.6)] sm:text-xs"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Reveal>
          )}
        </div>

        {products.length ? (
          <StaggerGroup className="jt-product-grid">
            {products.map((p) => (
              <StaggerItem key={p.id} className="min-w-0">
                <ProductCard product={p} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        ) : (
          <p className="text-sm text-jt-muted">Connect WooCommerce to load live products for this collection.</p>
        )}
      </div>
    </section>
  );
}
