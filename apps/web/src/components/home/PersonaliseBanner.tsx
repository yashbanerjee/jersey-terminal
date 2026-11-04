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
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/20 shadow-[0_40px_120px_-40px_rgba(164,255,20,0.5),0_30px_80px_-40px_rgba(139,92,246,0.5)]">
            {/* Lime base + animated colour wash */}
            <div className="absolute inset-0 jt-gradient-bg" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,7,13,0.35),transparent_55%)]" />
            <div className="jt-float absolute -right-10 -top-16 h-72 w-72 rounded-full bg-jt-cyan/40 blur-3xl" />
            <div className="jt-float absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-jt-violet/40 blur-3xl [animation-delay:-2.5s]" />
            <div className="absolute -left-10 -top-10 h-56 w-56 rounded-full bg-white/30 blur-3xl" />
            <div className="jt-grain absolute inset-0 opacity-20" />

            <div className="relative grid gap-8 p-6 sm:p-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:p-14">
              <div className="text-jt-black">
                <p className="inline-flex items-center gap-2 rounded-full bg-jt-black/85 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.28em] text-jt-neon">
                  <span className="h-1.5 w-1.5 rounded-full bg-jt-neon" />
                  Personalisation
                </p>
                <SplitHeading
                  text="Your name. Your number. Your jersey."
                  className="mt-4 jt-display text-4xl leading-[0.95] sm:text-5xl md:text-6xl"
                />
                <p className="mt-4 max-w-md text-sm font-medium text-jt-black/80 sm:text-base">
                  Pick any jersey, add your name and lucky number at checkout, and we print it match-ready
                  before it ships.
                </p>
                <div className="mt-6">
                  <MagneticButton
                    href="/shop"
                    className="!bg-jt-black !bg-none !text-white !shadow-[0_20px_50px_-15px_rgba(6,7,13,0.7)] hover:!shadow-[0_20px_60px_-15px_rgba(139,92,246,0.7)]"
                  >
                    Start customising <ArrowRight className="h-4 w-4" />
                  </MagneticButton>
                </div>
              </div>

              {/* Jersey back preview */}
              <div className="mx-auto w-full max-w-[300px] md:ml-auto">
                <div className="jt-glow-border relative aspect-[4/5] overflow-hidden rounded-2xl bg-jt-black shadow-[0_30px_80px_-20px_rgba(6,7,13,0.8)] ring-1 ring-black/30">
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(139,92,246,0.3),transparent_60%),radial-gradient(ellipse_at_50%_100%,rgba(164,255,20,0.18),transparent_55%)]" />
                  <div className="absolute inset-x-6 top-6 h-6 rounded-b-full border-b-2 border-white/15" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 overflow-hidden">
                    <span className="overflow-hidden">
                      <span
                        ref={nameRef}
                        className="jt-gradient-text block jt-display text-3xl tracking-[0.2em] sm:text-4xl"
                      >
                        {EXAMPLES[0][0]}
                      </span>
                    </span>
                    <span
                      ref={numRef}
                      className="block jt-display text-[9rem] leading-none text-white drop-shadow-[0_0_30px_rgba(164,255,20,0.35)] sm:text-[10rem]"
                    >
                      {EXAMPLES[0][1]}
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-jt-black/70 to-transparent" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
