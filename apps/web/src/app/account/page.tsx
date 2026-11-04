"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

const inputClass =
  "w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none focus:border-jt-neon";

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
      <h1 className="jt-display text-5xl tracking-wide">
        Account
      </h1>
      <div className="mt-6 flex gap-4 text-xs uppercase tracking-[0.16em]">
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
      </div>
      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        {mode === "register" && (
          <div className="grid grid-cols-2 gap-3">
            <input name="first_name" placeholder="First name" className={inputClass} />
            <input name="last_name" placeholder="Last name" className={inputClass} />
          </div>
        )}
        <input name="email" type="email" required placeholder="Email" className={inputClass} />
        <input name="password" type="password" required placeholder="Password" className={inputClass} />
        <button
          type="submit"
          className="jt-gradient-bg w-full py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
        >
          {mode === "login" ? "Sign in" : "Create account"}
        </button>
      </form>
      {message && <p className="mt-3 text-sm text-jt-muted">{message}</p>}
      <ul className="mt-10 space-y-2 text-sm text-jt-muted">
        <li>
          <Link href="/account/orders" className="hover:text-white">
            Order history
          </Link>
        </li>
        <li>
          <Link href="/account/wishlist" className="hover:text-white">
            Wishlist
          </Link>
        </li>
        <li>
          <Link href="/track" className="hover:text-white">
            Track order
          </Link>
        </li>
      </ul>
    </div>
  );
}
