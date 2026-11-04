"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
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
  new: "jt-gradient-bg text-jt-black",
  bestseller: "bg-jt-cyan text-jt-black",
  limited: "jt-gradient-bg-fire text-jt-black",
  sale: "bg-jt-coral text-white",
};

export function ProductCard({
  product,
  priority = false,
  /** Image + badges only — used inside the coverflow slider to avoid text overlap */
  mediaOnly = false,
}: {
  product: ProductCardModel;
  priority?: boolean;
  mediaOnly?: boolean;
}) {
  const toggle = useWishlistStore((s) => s.toggle);
  const wishedStored = useWishlistStore((s) => s.ids.includes(product.id));
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const wished = hydrated && wishedStored;

  // Enable pointer tilt only after mount so SSR HTML matches the first client paint.
  const [tiltReady, setTiltReady] = useState(false);
  useEffect(() => setTiltReady(true), []);

  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Strong left/right yaw + lighter pitch — mouse X drives the 3D turn
  const rotateY = useSpring(useTransform(px, [0, 1], [18, -18]), {
    stiffness: 180,
    damping: 18,
    mass: 0.45,
  });
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), {
    stiffness: 180,
    damping: 18,
    mass: 0.45,
  });
  // Lateral slide so the card physically leans left/right with the cursor
  const shiftX = useSpring(useTransform(px, [0, 1], [-14, 14]), {
    stiffness: 160,
    damping: 20,
    mass: 0.5,
  });
  const shiftY = useSpring(useTransform(py, [0, 1], [-8, 8]), {
    stiffness: 160,
    damping: 20,
    mass: 0.5,
  });

  // Soft spotlight that follows the pointer across the media
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(420px circle at ${glareX} ${glareY}, rgba(255,255,255,0.22), transparent 55%)`;

  function onMove(e: MouseEvent<HTMLElement>) {
    // Skip pointer tilt inside the coverflow slider — parent already owns 3D.
    if (!tiltReady || mediaOnly) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  const enable3d = tiltReady && !mediaOnly;

  return (
    <motion.article
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={
        enable3d
          ? {
              rotateX,
              rotateY,
              x: shiftX,
              y: shiftY,
              transformPerspective: 1100,
              transformStyle: "preserve-3d",
            }
          : undefined
      }
      whileHover={enable3d ? { scale: 1.03, zIndex: 20 } : undefined}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="jt-card group relative w-full min-w-0 will-change-transform"
    >
      <Link href={`/product/${product.slug}`} className="block" style={{ transformStyle: "preserve-3d" }}>
        {/* Animated gradient border shell */}
        <div className="jt-card-frame relative p-[2px]">
          <span aria-hidden className="jt-card-frame-glow" />
          <div className="jt-card-media jt-chamfer-sm relative aspect-[3/4] w-full overflow-hidden bg-gradient-to-br from-jt-surface via-jt-dark to-jt-surface">
            {product.image ? (
              <Image
                src={product.image.src}
                alt={product.image.alt}
                fill
                priority={priority}
                sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1536px) 25vw, 20vw"
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.08]"
              />
            ) : (
              <div className="flex h-full items-center justify-center jt-display text-4xl text-jt-muted">
                JT
              </div>
            )}

            {/* Pointer glare */}
            {enable3d && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: glare }}
              />
            )}

            <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />

            <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className={`jt-slant-sm px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider transition-transform duration-500 group-hover:translate-x-0.5 sm:px-3 sm:text-[10px] ${BADGE_STYLE[b]}`}
                >
                  {BADGE_LABEL[b]}
                </span>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-2 bottom-2 translate-y-4 opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-3 sm:bottom-3">
              <span className="jt-gradient-bg jt-slant flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-jt-black">
                View jersey
                <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </div>
          </div>
        </div>

        {!mediaOnly && (
          <div className="mt-3 space-y-1" style={{ transform: "translateZ(18px)" }}>
            {product.category && (
              <p className="truncate text-[10px] uppercase tracking-[0.2em] text-jt-muted sm:text-[11px]">
                {product.category}
              </p>
            )}
            <h3 className="line-clamp-2 text-sm font-medium text-white transition-colors duration-300 group-hover:text-jt-amber md:text-base">
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
        )}
      </Link>

      <motion.button
        type="button"
        whileHover={{ scale: 1.12 }}
        whileTap={{ scale: 0.85 }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggle(product.id)}
        className="absolute right-2 top-2 z-10 rounded-full bg-black/55 p-2 text-white backdrop-blur transition-colors hover:bg-black/80 sm:right-3 sm:top-3"
        style={{ transform: "translateZ(28px)" }}
      >
        <Heart
          className={`h-4 w-4 transition-all duration-300 ${
            wished ? "scale-110 fill-jt-neon text-jt-neon" : "group-hover:text-jt-neon"
          }`}
        />
      </motion.button>
    </motion.article>
  );
}
