"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, type MouseEvent } from "react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist";

const BADGE_LABEL: Record<ProductCardModel["badges"][number], string> = {
  new: "New",
  bestseller: "Featured",
  limited: "Limited",
  sale: "Sale",
};

/** Each badge type gets its own hue so a grid of cards reads as a colourful mix. */
const BADGE_STYLE: Record<ProductCardModel["badges"][number], string> = {
  new: "jt-gradient-bg text-jt-black shadow-[0_6px_18px_-6px_rgba(164,255,20,0.8)]",
  bestseller: "bg-white text-jt-black shadow-[0_6px_18px_-6px_rgba(255,255,255,0.6)]",
  limited: "jt-gradient-bg-violet text-white shadow-[0_6px_18px_-6px_rgba(139,92,246,0.9)]",
  sale: "bg-jt-coral text-white shadow-[0_6px_18px_-6px_rgba(255,92,108,0.9)]",
};

export function ProductCard({ product, priority = false }: { product: ProductCardModel; priority?: boolean }) {
  const toggle = useWishlistStore((s) => s.toggle);
  const wished = useWishlistStore((s) => s.ids.includes(product.id));

  // Subtle 3D tilt that follows the cursor.
  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [6, -6]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(px, [0, 1], [-6, 6]), { stiffness: 200, damping: 20 });

  function onMove(e: MouseEvent<HTMLElement>) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      whileHover={{ y: -6 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className="jt-card group relative w-full min-w-0 will-change-transform"
    >
      <Link href={`/product/${product.slug}`} className="block">
        <div className="jt-card-media relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gradient-to-br from-jt-surface via-jt-dark to-jt-surface ring-1 ring-white/[0.06]">
          {product.image ? (
            <Image
              src={product.image.src}
              alt={product.image.alt}
              fill
              priority={priority}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1536px) 25vw, 20vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center jt-display text-4xl text-jt-muted">
              JT
            </div>
          )}

          {/* Hover treatments */}
          <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
          <span aria-hidden className="jt-card-border pointer-events-none absolute inset-0 rounded-xl" />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />

          {/* Badges */}
          <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
            {product.badges.map((b) => (
              <span
                key={b}
                className={`rounded-sm px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-2 sm:text-[10px] ${BADGE_STYLE[b]}`}
              >
                {BADGE_LABEL[b]}
              </span>
            ))}
          </div>

          {/* Quick action slides up on hover */}
          <div className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-3 sm:bottom-3">
            <span className="jt-gradient-bg flex items-center justify-between rounded-lg px-3 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-jt-black shadow-[0_10px_30px_-10px_rgba(164,255,20,0.8)]">
              View jersey
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </div>
        </div>

        <div className="mt-3 space-y-1">
          {product.category && (
            <p className="truncate text-[10px] uppercase tracking-[0.2em] text-jt-muted sm:text-[11px]">
              {product.category}
            </p>
          )}
          <h3 className="line-clamp-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-jt-neon md:text-base">
            {product.name}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-semibold text-white">{formatAED(product.price)}</span>
            {product.onSale && product.regularPrice && (
              <>
                <span className="text-jt-muted line-through">{formatAED(product.regularPrice)}</span>
                <span className="rounded-sm bg-jt-coral/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-jt-coral">
                  -{Math.round((1 - Number(product.price) / Number(product.regularPrice)) * 100)}%
                </span>
              </>
            )}
          </div>
        </div>
      </Link>

      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 rounded-full bg-black/55 p-2 text-white backdrop-blur transition-colors hover:bg-black/80 sm:right-3 sm:top-3"
      >
        <Heart className={`h-4 w-4 transition-transform ${wished ? "scale-110 fill-jt-neon text-jt-neon" : ""}`} />
      </motion.button>
    </motion.article>
  );
}
