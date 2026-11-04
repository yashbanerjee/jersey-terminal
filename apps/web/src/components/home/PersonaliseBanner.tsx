"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { MagneticButton } from "@/components/motion/MagneticButton";

const EXAMPLES: Array<[string, string]> = [
  ["YOUR NAME", "7"],
  ["RASHID", "10"],
  ["AHMED", "9"],
  ["SARA", "23"],
  ["KHALID", "11"],
];

/** Full-bleed CTA banner with a live "name & number" preview cycling through examples. */
export function PersonaliseBanner() {
  const root = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const numRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let i = 0;
    const name = nameRef.current;
    const num = numRef.current;
    if (!name || !num) return;
    // Lightweight text swap — no continuous GSAP timeline.
    const id = window.setInterval(() => {
      i = (i + 1) % EXAMPLES.length;
      name.textContent = EXAMPLES[i][0];
      num.textContent = EXAMPLES[i][1];
    }, 3200);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section ref={root} className="w-full py-6 sm:py-8 md:py-9">
      <div className="jt-container">
        <Reveal effect="3d" y={40} idle="breathe">
          <div className="jt-chamfer jt-drop-orange relative bg-[linear-gradient(135deg,rgba(255,122,26,0.9),rgba(255,255,255,0.2)_40%,rgba(46,230,255,0.8))] p-px">
            <div className="jt-chamfer relative overflow-hidden bg-jt-dark">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(255,122,26,0.35),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(46,230,255,0.22),transparent_55%)]" />
              <div className="pointer-events-none absolute left-[-20%] top-[22%] h-[3px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.9),transparent)] blur-[1px]" />
              <div className="pointer-events-none absolute left-[-20%] top-[58%] h-[2px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.8),transparent)] blur-[1px]" />
              <div className="jt-float absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-jt-orange/25 blur-3xl" />
              <div className="jt-dots absolute right-[-2%] top-[-10%] h-[70%] w-[30%] opacity-20" />
              <div className="jt-grain absolute inset-0 opacity-[0.08]" />

              <div className="relative grid gap-6 p-5 sm:gap-8 sm:p-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:p-10 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <p className="inline-flex items-center gap-2 jt-slant-sm bg-jt-neon/12 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-jt-neon">
                    <span className="h-1.5 w-1.5 rounded-full bg-jt-neon" />
                    Personalisation
                  </p>
                  <SplitHeading
                    text="Your name. Your number. Your jersey."
                    accentWords={[5, 6]}
                    className="mt-3 jt-display text-[clamp(1.9rem,5vw,3.25rem)] leading-[0.95] text-white"
                  />
                  <p className="mt-3 max-w-md text-sm text-white/70 sm:text-[15px]">
                    Pick any jersey, add your name and lucky number at checkout, and we print it match-ready
                    before it ships.
                  </p>
                  <ul className="mt-4 grid gap-2 text-xs uppercase tracking-[0.14em] text-white/55 sm:grid-cols-3">
                    <li className="border border-white/10 bg-white/[0.03] px-3 py-2">Name print</li>
                    <li className="border border-white/10 bg-white/[0.03] px-3 py-2">Number lock</li>
                    <li className="border border-white/10 bg-white/[0.03] px-3 py-2">Match ready</li>
                  </ul>
                  <div className="mt-5">
                    <MagneticButton href="/shop">
                      Start customising <ArrowRight className="h-4 w-4" />
                    </MagneticButton>
                  </div>
                </div>

                <div className="mx-auto grid w-full max-w-[340px] gap-3 md:ml-auto">
                  <div className="jt-chamfer-sm relative bg-[linear-gradient(160deg,rgba(46,230,255,0.8),rgba(255,255,255,0.15)_45%,rgba(255,122,26,0.8))] p-px">
                    <div className="jt-chamfer-sm relative aspect-[4/5] overflow-hidden bg-jt-black">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_25%,rgba(255,122,26,0.28),transparent_60%),radial-gradient(ellipse_at_50%_100%,rgba(46,230,255,0.16),transparent_55%)]" />
                      <div className="absolute inset-x-6 top-6 h-6 rounded-b-full border-b-2 border-white/15" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden">
                        <span className="overflow-hidden">
                          <span
                            ref={nameRef}
                            className="jt-gradient-text-fire block jt-display text-3xl tracking-[0.12em] sm:text-4xl"
                          >
                            {EXAMPLES[0][0]}
                          </span>
                        </span>
                        <span
                          ref={numRef}
                          className="block jt-display text-[clamp(5rem,24vw,8.5rem)] leading-none text-white drop-shadow-[0_0_30px_rgba(255,122,26,0.4)]"
                        >
                          {EXAMPLES[0][1]}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-jt-black/80 to-transparent" />
                    </div>
                  </div>
                  <div className="jt-snap flex gap-2 overflow-x-auto pb-1">
                    {EXAMPLES.map(([n, num]) => (
                      <span
                        key={`${n}-${num}`}
                        className="shrink-0 border border-white/10 bg-black/40 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.16em] text-white/60"
                      >
                        {n} · {num}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
