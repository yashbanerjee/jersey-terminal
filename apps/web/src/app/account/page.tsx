"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

const inputClass =
  "w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none transition focus:border-jt-neon";

export default function AccountPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [message, setMessage] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      username: String(fd.get("email") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      first_name: String(fd.get("first_name") || ""),
      last_name: String(fd.get("last_name") || ""),
    };

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMessage(res.ok ? "Success" : data.error || "Failed");
  }

  return (
    <div className="jt-page jt-container w-full max-w-lg">
      <Reveal effect="blur">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-jt-neon">Member</p>
      </Reveal>
      <SplitHeading as="h1" text="Account" className="jt-display text-5xl tracking-wide sm:text-6xl" />

      <Reveal delay={0.1} className="mt-6 flex gap-4 text-xs uppercase tracking-[0.16em]">
        <button
          type="button"
          className={mode === "login" ? "text-jt-neon" : "text-jt-muted"}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={mode === "register" ? "text-jt-neon" : "text-jt-muted"}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </Reveal>

      <Reveal effect="3d" delay={0.15} className="mt-6">
        <form onSubmit={onSubmit} className="space-y-3">
          <AnimatePresence initial={false}>
            {mode === "register" && (
              <motion.div
                key="names"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 gap-3 overflow-hidden"
              >
                <input name="first_name" placeholder="First name" className={inputClass} />
                <input name="last_name" placeholder="Last name" className={inputClass} />
              </motion.div>
            )}
          </AnimatePresence>
          <input name="email" type="email" required placeholder="Email" className={inputClass} />
          <input name="password" type="password" required placeholder="Password" className={inputClass} />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="jt-gradient-bg jt-slant w-full py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
          >
            {mode === "login" ? "Sign in" : "Create account"}
          </motion.button>
        </form>
      </Reveal>

      <AnimatePresence mode="wait">
        {message && (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm text-jt-muted"
          >
            {message}
          </motion.p>
        )}
      </AnimatePresence>

      <Reveal delay={0.25} className="mt-10">
        <ul className="space-y-2 text-sm text-jt-muted">
          <li>
            <Link href="/account/orders" className="transition hover:text-white">
              Order history
            </Link>
          </li>
          <li>
            <Link href="/account/wishlist" className="transition hover:text-white">
              Wishlist
            </Link>
          </li>
          <li>
            <Link href="/track" className="transition hover:text-white">
              Track order
            </Link>
          </li>
        </ul>
      </Reveal>
    </div>
  );
}
