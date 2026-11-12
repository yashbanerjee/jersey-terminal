"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { UNITED_TIGERS_SQUAD, type SquadPhoto } from "@/lib/squad";

export function SquadGallery({ photos = UNITED_TIGERS_SQUAD }: { photos?: SquadPhoto[] }) {
  const [active, setActive] = useState<SquadPhoto | null>(null);

  return (
    <section className="relative w-full overflow-hidden py-7 sm:py-9 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_0%,rgba(168,85,247,0.18),transparent_45%),radial-gradient(ellipse_at_90%_80%,rgba(255,45,120,0.12),transparent_50%)]" />

      <div className="jt-container relative">
        <div className="mb-5 flex flex-col gap-3 sm:mb-7 md:flex-row md:items-end md:justify-between">
          <div>
            <Reveal>
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon">
                United Tigers · Squad
              </p>
            </Reveal>
            <SplitHeading
              text="On the pitch"
              className="mt-2 jt-display text-[clamp(1.85rem,5vw,3rem)] leading-[0.95] text-white"
            />
            <Reveal delay={0.06}>
              <p className="mt-2 max-w-xl text-sm text-white/65">
                Squad kit photography — players wearing the official United Tigers jersey. Shop the
                match and training cuts below.
              </p>
            </Reveal>
          </div>
          <Reveal delay={0.1}>
            <Link
              href="/product/united-tiger-match-jersey"
              className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-jt-neon hover:text-white"
            >
              Shop match jersey <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Reveal>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <Reveal key={photo.src} delay={Math.min(i * 0.03, 0.24)} y={16}>
              <button
                type="button"
                onClick={() => setActive(photo)}
                className="group relative aspect-[3/4] w-full overflow-hidden border border-white/10 bg-[radial-gradient(ellipse_at_50%_70%,#4a0d5c_0%,#1a0824_52%,#050607_100%)] text-left"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="!object-contain !object-center transition duration-500 group-hover:scale-[1.03]"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-10">
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                    {photo.name}
                  </span>
                </span>
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 p-4 sm:p-8">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Close photo"
            onClick={() => setActive(null)}
          />
          <div className="relative z-[1] max-h-[90svh] w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute -top-2 right-0 z-[2] rounded-full bg-black/60 p-2 text-white hover:bg-black"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-white/15 bg-[radial-gradient(ellipse_at_50%_70%,#4a0d5c_0%,#1a0824_52%,#050607_100%)] sm:aspect-[4/5]">
              <Image
                src={active.src}
                alt={active.alt}
                fill
                sizes="(max-width: 768px) 100vw, 768px"
                className="!object-contain !object-center"
                priority
              />
            </div>
            <p className="mt-3 text-center text-sm uppercase tracking-[0.16em] text-white/80">
              {active.name}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
