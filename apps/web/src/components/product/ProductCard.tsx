"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight, Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useSyncExternalStore, type MouseEvent } from "react";
import type { ProductCardModel } from "@/lib/woo/types";
import { formatAED } from "@/lib/format";
import { useWishlistStore } from "@/store/wishlist";

const BADGE_LABEL: Record<ProductCardModel["badges"][number], string> = {
  new: "New",
  bestseller: "Featured",
  limited: "Limited",
  sale: "Sale",
};

const BADGE_STYLE: Record<ProductCardModel["badges"][number], string> = {
  new: "jt-gradient-bg text-jt-black",
  bestseller: "bg-jt-cyan text-jt-black",
  limited: "jt-gradient-bg-fire text-jt-black",
  sale: "bg-jt-coral text-white",
};

/** Playing-card jersey tile — deep 3D tilt, glowing cut border, holographic motion. */
export function ProductCard({
  product,
  priority = false,
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

  // Static cards — perpetual 3D tilt/float was lagging scroll on every device.
  const [tiltReady] = useState(false);

  const ref = useRef<HTMLElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  // Deep playing-card 3D — strong left/right yaw + lift toward camera
  const rotateY = useSpring(useTransform(px, [0, 1], [32, -32]), {
    stiffness: 140,
    damping: 14,
    mass: 0.35,
  });
  const rotateX = useSpring(useTransform(py, [0, 1], [20, -20]), {
    stiffness: 140,
    damping: 14,
    mass: 0.35,
  });
  const shiftX = useSpring(useTransform(px, [0, 1], [-26, 26]), {
    stiffness: 120,
    damping: 16,
    mass: 0.4,
  });
  const shiftY = useSpring(useTransform(py, [0, 1], [-18, 14]), {
    stiffness: 120,
    damping: 16,
    mass: 0.4,
  });
  const liftZ = useSpring(0, { stiffness: 180, damping: 16 });
  // Jersey art parallax — moves opposite the tilt for depth
  const artX = useSpring(useTransform(px, [0, 1], [14, -14]), { stiffness: 100, damping: 18 });
  const artY = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 100, damping: 18 });
  const artScale = useSpring(useTransform(px, [0, 0.5, 1], [1.08, 1.12, 1.08]), {
    stiffness: 100,
    damping: 18,
  });

  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(py, [0, 1], ["0%", "100%"]);
  const glare = useMotionTemplate`radial-gradient(520px circle at ${glareX} ${glareY}, rgba(255,255,255,0.4), rgba(180,255,26,0.14) 32%, rgba(46,230,255,0.1) 48%, transparent 65%)`;

  const enable3d = tiltReady && !mediaOnly;

  function onMove(e: MouseEvent<HTMLElement>) {
    if (!enable3d) return;
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
    liftZ.set(48);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    liftZ.set(0);
  }

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
              z: liftZ,
              transformPerspective: 780,
              transformStyle: "preserve-3d",
            }
          : { transformStyle: "preserve-3d" }
      }
      className="jt-card jt-playing-card group relative w-full min-w-0"
    >
      {/* Outer aura — soft animated glow behind the cut plate */}
      <span aria-hidden className="jt-card-aura" />

      <Link href={`/product/${product.slug}`} className="relative block" style={{ transformStyle: "preserve-3d" }}>
        <div className="jt-card-frame jt-playing-frame relative p-[3px] sm:p-[3.5px]">
          <span aria-hidden className="jt-card-border-run" />
          <span aria-hidden className="jt-card-border-bloom" />

          <div className="jt-card-media jt-playing-face relative aspect-[5/7] w-full overflow-hidden bg-jt-dark">
            <span aria-hidden className="jt-playing-inset pointer-events-none absolute inset-[5px] z-[1] sm:inset-[6px]" />

            {product.image ? (
              <motion.div
                className="absolute inset-[-8%] h-[116%] w-[116%]"
                style={
                  enable3d
                    ? { x: artX, y: artY, scale: artScale, transformStyle: "preserve-3d" }
                    : undefined
                }
              >
                <Image
                  src={product.image.src}
                  alt={product.image.alt}
                  fill
                  priority={priority}
                  sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, (max-width:1536px) 25vw, 20vw"
                  className="object-cover"
                />
              </motion.div>
            ) : (
              <div className="flex h-full items-center justify-center jt-display text-4xl text-jt-muted">JT</div>
            )}

            {enable3d && (
              <motion.span
                aria-hidden
                className="pointer-events-none absolute inset-0 z-[1] opacity-0 mix-blend-soft-light transition-opacity duration-300 group-hover:opacity-100"
                style={{ background: glare }}
              />
            )}

            <span aria-hidden className="jt-card-shine jt-holo-shine pointer-events-none absolute inset-0 z-[1]" />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-1/2 bg-gradient-to-t from-black/80 via-black/25 to-transparent opacity-75 transition-opacity duration-500 group-hover:opacity-95"
            />

            <div
              className="absolute left-2 top-2 z-[2] flex flex-col gap-1 sm:left-3 sm:top-3"
              style={{ transform: "translateZ(40px)" }}
            >
              {product.badges.map((b) => (
                <span
                  key={b}
                  className={`jt-slant-sm px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider sm:px-3 sm:text-[10px] ${BADGE_STYLE[b]}`}
                >
                  {BADGE_LABEL[b]}
                </span>
              ))}
            </div>

            <div
              className="pointer-events-none absolute inset-x-2 bottom-2 z-[2] translate-y-3 opacity-0 transition-all duration-500 ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 group-hover:opacity-100 sm:inset-x-3 sm:bottom-3"
              style={{ transform: "translateZ(44px)" }}
            >
              <span className="jt-gradient-bg jt-slant flex items-center justify-between px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-jt-black shadow-[0_8px_24px_-8px_rgba(180,255,26,0.7)]">
                View jersey
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>

        {!mediaOnly && (
          <div className="mt-3 space-y-1 px-0.5" style={{ transform: "translateZ(24px)" }}>
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
        whileHover={{ scale: 1.14 }}
        whileTap={{ scale: 0.85 }}
        aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        onClick={() => toggle(product.id)}
        className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white backdrop-blur transition-colors hover:bg-black/80 sm:right-3.5 sm:top-3.5"
        style={{ transform: "translateZ(52px)" }}
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
