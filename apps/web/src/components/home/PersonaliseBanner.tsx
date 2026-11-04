"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
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
    const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.6 });
    tl.to(name, { yPercent: -100, opacity: 0, duration: 0.4, ease: "power2.in" })
      .to(num, { yPercent: -40, opacity: 0, scale: 0.9, duration: 0.4, ease: "power2.in" }, "<0.05")
      .add(() => {
        i = (i + 1) % EXAMPLES.length;
        name.textContent = EXAMPLES[i][0];
        num.textContent = EXAMPLES[i][1];
      })
      .fromTo(name, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: "power3.out" })
      .fromTo(
        num,
        { yPercent: 40, opacity: 0, scale: 1.1 },
        { yPercent: 0, opacity: 1, scale: 1, duration: 0.6, ease: "back.out(1.6)" },
        "<0.05",
      );
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={root} className="w-full py-8 sm:py-10 md:py-14">
      <div className="jt-container">
        <Reveal effect="3d" y={36}>
          {/* Chamfered panel with a gradient edge */}
          <div className="jt-chamfer jt-drop-orange relative bg-[linear-gradient(135deg,rgba(255,122,26,0.9),rgba(255,255,255,0.2)_40%,rgba(46,230,255,0.8))] p-px">
            <div className="jt-chamfer relative overflow-hidden bg-jt-dark">
              {/* Streaks + glows */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(255,122,26,0.35),transparent_55%),radial-gradient(ellipse_at_100%_0%,rgba(46,230,255,0.22),transparent_55%)]" />
              <div className="pointer-events-none absolute left-[-20%] top-[22%] h-[3px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,122,26,0.9),transparent)] blur-[1px]" />
              <div className="pointer-events-none absolute left-[-20%] top-[58%] h-[2px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(46,230,255,0.8),transparent)] blur-[1px]" />
              <div className="pointer-events-none absolute left-[-20%] top-[80%] h-[6px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(255,176,32,0.5),transparent)] blur-[4px]" />
              <div className="jt-float absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-jt-orange/25 blur-3xl" />
              <div className="jt-dots absolute right-[-2%] top-[-10%] h-[70%] w-[30%] opacity-20" />
              <div className="jt-grain absolute inset-0 opacity-[0.08]" />

              <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-14">
                <div>
                  <p className="inline-flex items-center gap-2 jt-slant-sm bg-jt-neon/12 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-jt-neon">
                    <span className="h-1.5 w-1.5 rounded-full bg-jt-neon" />
                    Personalisation
                  </p>
                  <SplitHeading
                    text="Your name. Your number. Your jersey."
                    accentWords={[5, 6]}
                    className="mt-4 jt-display text-4xl leading-[0.95] text-white sm:text-5xl md:text-6xl"
                  />
                  <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                    Pick any jersey, add your name and lucky number at checkout, and we print it match-ready
                    before it ships.
                  </p>
                  <div className="mt-7">
                    <MagneticButton href="/shop">
                      Start customising <ArrowRight className="h-4 w-4" />
                    </MagneticButton>
                  </div>
                </div>

                {/* Jersey back preview */}
                <div className="mx-auto w-full max-w-[300px] md:ml-auto">
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
                          className="block jt-display text-[9rem] leading-none text-white drop-shadow-[0_0_30px_rgba(255,122,26,0.4)] sm:text-[10rem]"
                        >
                          {EXAMPLES[0][1]}
                        </span>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-jt-black/80 to-transparent" />
                    </div>
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
