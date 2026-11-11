import type { Metadata } from "next";
import { CustomOrderBuilder } from "@/components/custom/CustomOrderBuilder";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { CUSTOM_MOQ, CUSTOM_TIERS, formatUSD } from "@/lib/custom-order";

export const metadata: Metadata = {
  title: "Custom Jerseys",
  description:
    "Order your own customised jerseys in Basic, Premium, or Luxury packages. Minimum 15 pieces. Jersey price plus freight.",
};

export default async function CustomOrderPage({
  searchParams,
}: {
  searchParams: Promise<{ cancelled?: string }>;
}) {
  const sp = await searchParams;
  const cancelled = sp.cancelled === "1";

  return (
    <div className="jt-page w-full">
      <div className="jt-container max-w-6xl">
        <Reveal>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-jt-neon">
            Custom programme
          </p>
        </Reveal>
        <SplitHeading
          as="h1"
          text="Order your own jersey"
          className="jt-display text-[clamp(2.2rem,6vw,4.2rem)] leading-[0.92] tracking-wide"
        />
        <Reveal delay={0.08}>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/70 sm:text-base">
            Design a full kit for your club, academy, or event. Choose Basic, Premium, or Luxury —
            minimum {CUSTOM_MOQ} jerseys. Checkout covers jersey cost plus freight for your delivery
            zone.
          </p>
        </Reveal>

        {cancelled && (
          <p className="mt-4 border border-jt-orange/40 bg-jt-orange/10 px-4 py-3 text-sm text-jt-amber">
            Checkout was cancelled — your selections are still here when you are ready to pay.
          </p>
        )}

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {(Object.keys(CUSTOM_TIERS) as Array<keyof typeof CUSTOM_TIERS>).map((id) => {
            const t = CUSTOM_TIERS[id];
            return (
              <div key={id} className="border border-white/10 bg-white/[0.03] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-jt-muted">{t.name}</p>
                <p className="mt-1 jt-display text-2xl">
                  <span className="jt-gradient-text-fire">{formatUSD(t.priceUsd)}</span>
                  <span className="ml-1 text-xs font-sans uppercase tracking-[0.16em] text-white/45">
                    / jersey
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10">
          <CustomOrderBuilder />
        </div>
      </div>
    </div>
  );
}
