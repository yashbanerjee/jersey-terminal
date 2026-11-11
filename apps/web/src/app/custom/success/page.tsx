import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { loadCustomBrief } from "@/lib/custom-order-store";

export default async function CustomOrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string; ref?: string }>;
}) {
  const sp = await searchParams;
  const orderRef = sp.ref?.trim() || "";
  const brief = orderRef ? await loadCustomBrief(orderRef) : null;

  return (
    <div className="jt-page jt-container max-w-3xl">
      <Reveal>
        <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-jt-neon/15 text-jt-neon">
          <CheckCircle2 className="h-7 w-7" />
        </div>
      </Reveal>
      <SplitHeading
        as="h1"
        text="Custom kit order received"
        className="jt-display text-4xl tracking-wide sm:text-5xl"
      />
      <Reveal delay={0.1}>
        <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
          Payment for jerseys and freight is confirmed. Our kit team will email you within one
          business day with the artwork proof, size confirmation, and production timeline.
        </p>
        {(orderRef || brief) && (
          <div className="mt-6 border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/70">
            {orderRef && (
              <p>
                Order ref: <span className="font-medium text-white">{orderRef}</span>
              </p>
            )}
            {brief && (
              <>
                <p className="mt-2">
                  Team: <span className="text-white">{brief.teamName}</span> · {brief.quantity}{" "}
                  jerseys · {brief.tier}
                </p>
                {brief.sponsors.length > 0 && (
                  <p className="mt-1">
                    Sponsors: {brief.sponsors.map((s) => `${s.name} (${s.placement})`).join(", ")}
                  </p>
                )}
              </>
            )}
          </div>
        )}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/custom"
            className="jt-gradient-bg inline-flex px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-jt-black"
          >
            Place another kit order
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
