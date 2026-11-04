import { Gauge, Shirt, Sparkles } from "lucide-react";

const PILLARS = [
  {
    icon: Shirt,
    title: "Match-ready cut",
    text: "Athletic fit, breathable knit, and finish that holds up from kickoff to night out.",
  },
  {
    icon: Sparkles,
    title: "Drop culture",
    text: "Limited colourways and seasonal kits land first for fans who move fast.",
  },
  {
    icon: Gauge,
    title: "Built to ship",
    text: "UAE-first fulfilment with tracked international routes when you need them.",
  },
];

export function BrandStory() {
  return (
    <section className="relative w-full overflow-hidden border-y border-white/5 bg-jt-dark/80 py-9 sm:py-11 md:py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(180,255,26,0.14),transparent_45%),radial-gradient(circle_at_right,rgba(255,122,26,0.18),transparent_45%)]" />
      <div className="relative jt-container">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-12">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon">Why Jersey Terminal</p>
            <h2 className="jt-display story-line text-[clamp(1.8rem,4vw,3rem)] leading-[0.95]">
              Built for fans who
              <span className="jt-gradient-text-fire"> play louder</span>
            </h2>
            <p className="story-line mt-4 max-w-xl text-sm leading-relaxed text-jt-muted sm:text-base">
              Premium kits with real athletic cut, drop energy, and shipping that keeps up with match day.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="story-line jt-chamfer-sm border border-white/10 bg-white/[0.03] p-4"
              >
                <Icon className="mb-2 h-5 w-5 text-jt-neon" aria-hidden />
                <h3 className="jt-display text-sm tracking-wide text-white">{title}</h3>
                <p className="mt-1.5 text-xs leading-relaxed text-jt-muted sm:text-sm">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
