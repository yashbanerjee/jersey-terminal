"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
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
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    let kill: (() => void) | undefined;
    (async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);
      const ctx = gsap.context(() => {
        gsap.fromTo(
          ".story-line",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.75,
            scrollTrigger: { trigger: ref.current, start: "top 75%" },
          },
        );
      }, ref);
      kill = () => ctx.revert();
    })();
    return () => kill?.();
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden border-y border-white/5 bg-jt-dark/70 py-9 backdrop-blur-sm sm:py-11 md:py-12"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_left,rgba(180,255,26,0.14),transparent_45%),radial-gradient(circle_at_right,rgba(255,122,26,0.18),transparent_45%)]" />
      <div className="relative jt-container">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-12">
          <div>
            <p className="story-line text-xs uppercase tracking-[0.3em] text-jt-neon">The JT Standard</p>
            <h2 className="story-line mt-3 max-w-xl jt-display text-[clamp(2rem,5vw,3.4rem)] leading-[0.95] tracking-wide">
              Built for the pitch.
              <br />
              Worn beyond it.
            </h2>
            <p className="story-line mt-3 max-w-lg text-sm text-jt-muted sm:text-[15px]">
              From match-day jerseys to training layers and fan essentials, every drop is curated for athletes
              and supporters who want premium presentation with performance detail.
            </p>
          </div>

          <div className="story-line grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {PILLARS.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="jt-chamfer-sm border border-white/10 bg-white/[0.03] p-4 backdrop-blur"
              >
                <span className="grid h-9 w-9 place-items-center jt-slant-sm bg-jt-neon/12 text-jt-neon">
                  <Icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-sm font-semibold text-white">{title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-jt-muted">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
