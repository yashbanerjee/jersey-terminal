import type { Metadata } from "next";
import Link from "next/link";
import { SquadGallery } from "@/components/home/SquadGallery";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export const metadata: Metadata = {
  title: "United Tigers Squad",
  description: "Squad kit photography for United Tigers — players wearing the official Jersey Terminal kit.",
};

export default function SquadPage() {
  return (
    <div className="jt-page w-full">
      <div className="jt-container max-w-5xl pb-4 pt-2">
        <Reveal>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-jt-neon">
            Gallery
          </p>
        </Reveal>
        <SplitHeading
          as="h1"
          text="United Tigers squad"
          className="jt-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.92] tracking-wide"
        />
        <Reveal delay={0.08}>
          <p className="mt-3 max-w-2xl text-sm text-white/65">
            Player photography only — product shots for the match and training jerseys stay on the shop
            pages.{" "}
            <Link href="/shop" className="text-jt-neon hover:underline">
              Browse kits
            </Link>
          </p>
        </Reveal>
      </div>
      <SquadGallery />
    </div>
  );
}
