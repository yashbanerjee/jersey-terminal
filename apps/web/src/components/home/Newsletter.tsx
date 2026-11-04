"use client";

import { FormEvent, useState } from "react";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "ok">("idle");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("ok");
  }

  return (
    <section className="w-full py-12 sm:py-16 md:py-20">
      <div className="jt-container">
        <div className="relative w-full overflow-hidden bg-jt-surface px-5 py-10 sm:px-8 sm:py-12 md:px-12">
          <div className="absolute inset-0 jt-gradient-bg opacity-10" />
          <div className="relative grid w-full gap-6 md:grid-cols-[1.2fr_1fr] md:items-center md:gap-8">
            <div>
              <h2 className="jt-display text-3xl tracking-wide sm:text-4xl md:text-5xl">
                Drop alerts. First access.
              </h2>
              <p className="mt-3 text-sm text-jt-muted">
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
