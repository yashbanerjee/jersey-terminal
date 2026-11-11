"use client";

import { FormEvent, useState } from "react";

export function Newsletter() {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = new FormData(form).get("email");
    setStatus("loading");
    setMessage("");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Signup failed");
      setStatus("ok");
      setMessage("You're on the list — we'll ping new kit drops.");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not subscribe");
    }
  }

  return (
    <section className="w-full py-7 sm:py-9 md:py-10">
      <div className="jt-container">
        <div className="jt-chamfer relative w-full overflow-hidden border border-white/10 bg-jt-surface px-5 py-7 sm:px-8 sm:py-8 md:px-10">
          <div className="absolute inset-0 jt-gradient-bg opacity-10" />
          <div className="relative grid w-full gap-5 md:grid-cols-[1.15fr_1fr] md:items-center md:gap-8">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-jt-neon">Stay early</p>
              <h2 className="mt-1.5 jt-display text-[clamp(1.85rem,5vw,2.75rem)] leading-[0.95] tracking-wide">
                Kit drop alerts
              </h2>
              <p className="mt-2 max-w-md text-sm text-jt-muted">
                United Tigers restocks, new clubs, and custom kit offers — AED storefront, UAE + worldwide.
              </p>
            </div>
            <form onSubmit={onSubmit} className="flex w-full flex-col gap-3 sm:flex-row">
              <label className="sr-only" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@email.com"
                className="min-h-12 w-full flex-1 border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              />
              <button
                type="submit"
                disabled={status === "loading"}
                className="jt-gradient-bg min-h-12 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black disabled:opacity-60 sm:shrink-0"
              >
                {status === "loading" ? "Joining…" : "Join"}
              </button>
            </form>
            {message && (
              <p className={`text-sm md:col-span-2 ${status === "error" ? "text-jt-coral" : "text-jt-neon"}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
