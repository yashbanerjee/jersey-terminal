import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/motion/MagneticButton";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { CUSTOM_MOQ, CUSTOM_TIERS, formatAEDMoney } from "@/lib/custom-order";

export function CustomKitTeaser() {
  return (
    <section className="w-full py-7 sm:py-9 md:py-11">
      <div className="jt-container">
        <Reveal effect="up">
          <div className="jt-chamfer relative overflow-hidden border border-white/10 bg-jt-dark">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_0%,rgba(180,255,26,0.18),transparent_45%),radial-gradient(ellipse_at_100%_100%,rgba(255,122,26,0.22),transparent_50%)]" />
            <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:p-10">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon">
                  Custom kits · MOQ {CUSTOM_MOQ}
                </p>
                <SplitHeading
                  text="Build your own jersey run"
                  className="mt-3 jt-display text-[clamp(1.8rem,4.5vw,3rem)] leading-[0.95] text-white"
                />
                <p className="mt-3 max-w-xl text-sm text-white/65 sm:text-[15px]">
                  Team owners: pick a package, upload your logo, add player names & numbers, and
                  place sponsors — then pay per jersey plus freight.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {(Object.keys(CUSTOM_TIERS) as Array<keyof typeof CUSTOM_TIERS>).map((id) => (
                    <span
                      key={id}
                      className="border border-white/12 bg-black/35 px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] text-white/70"
                    >
                      {CUSTOM_TIERS[id].name} {formatAEDMoney(CUSTOM_TIERS[id].priceAed)}
                    </span>
                  ))}
                </div>
                <div className="mt-6">
                  <MagneticButton href="/custom">
                    Start custom order <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {(Object.keys(CUSTOM_TIERS) as Array<keyof typeof CUSTOM_TIERS>).map((id) => {
                  const t = CUSTOM_TIERS[id];
                  return (
                    <div key={id} className="border border-white/10 bg-white/[0.03] px-4 py-3">
                      <p className="text-[10px] uppercase tracking-[0.2em] text-jt-muted">{t.name}</p>
                      <p className="mt-1 text-sm text-white/80">{t.highlights[0]}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
