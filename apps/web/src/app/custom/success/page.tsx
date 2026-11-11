import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export default function CustomOrderSuccessPage() {
  return (
    <div className="jt-page jt-container max-w-3xl">
      <Reveal>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-jt-neon/15 text-jt-neon">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </Reveal>
      <SplitHeading
        as="h1"
        text="Custom order received"
        className="jt-display text-4xl tracking-wide sm:text-5xl"
      />
      <Reveal delay={0.1}>
        <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
          Payment for jerseys and freight is confirmed. Our kit team will email you within one
          business day with the artwork brief, size sheet, and production timeline.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/custom"
            className="jt-gradient-bg inline-flex px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-jt-black"
          >
            Place another order
          </Link>
          <Link
            href="/shop"
            className="inline-flex border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-white"
          >
            Browse ready kits
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
