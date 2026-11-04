"use client";

import { FormEvent, useState } from "react";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("ok");
  }

  return (
    <section className="w-full py-7 sm:py-9 md:py-10">
      <div className="jt-container">
        <div className="jt-chamfer relative w-full overflow-hidden border border-white/10 bg-jt-surface px-5 py-7 sm:px-8 sm:py-8 md:px-10">
          <div className="absolute inset-0 jt-gradient-bg opacity-10" />
          <div className="pointer-events-none absolute left-[-20%] top-[40%] h-[2px] w-[140%] -rotate-[22deg] bg-[linear-gradient(90deg,transparent,rgba(180,255,26,0.55),transparent)]" />
          <div className="relative grid w-full gap-5 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-jt-neon">Stay early</p>
              <h2 className="mt-1.5 jt-display text-[clamp(1.85rem,5vw,2.75rem)] leading-[0.95] tracking-wide">
                Drop alerts. First access.
              </h2>
              <p className="mt-2 max-w-md text-sm text-jt-muted">
                Limited editions and match kits land here first. AED storefront. UAE + international.
              </p>
            </div>
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="you@email.com"
                className="min-h-12 w-full flex-1 border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              />
              <button
                type="submit"
                className="jt-gradient-bg min-h-12 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black sm:shrink-0"
              >
                Join
              </button>
            </form>
            {status === "ok" && (
              <p className="text-sm text-jt-neon md:col-span-2">You&apos;re on the list.</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
