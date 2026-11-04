"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { useCartStore } from "@/store/cart";
import { cn } from "@/lib/format";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/jerseys", label: "Jerseys" },
  { href: "/shop/training-wear", label: "Training" },
  { href: "/shop/limited-editions", label: "Limited" },
  { href: "/track", label: "Track" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, toggle } = useCartStore();
  const pathname = usePathname();

  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.3 });

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 24);
    if (mobileOpen) return setHidden(false);
    setHidden(y > prev && y > 140);
  });

  useEffect(() => {
    lockScroll(mobileOpen);
    return () => lockScroll(false);
  }, [mobileOpen]);

  return (
    <motion.header
      initial={false}
      animate={{ y: hidden ? "-100%" : "0%" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-500",
        scrolled || mobileOpen
          ? "border-white/10 bg-jt-black/70 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9),0_1px_0_0_rgba(180,255,26,0.08)] backdrop-blur-xl"
          : "border-transparent bg-transparent",
      )}
    >
      {/* Scroll progress — aurora gradient */}
      <motion.span
        aria-hidden
        style={{ scaleX: progress }}
        className="jt-gradient-bg-aurora absolute inset-x-0 top-0 h-[2px] origin-left shadow-[0_0_12px_rgba(180,255,26,0.6)]"
      />

      <div className="jt-container flex h-16 items-center justify-between md:h-20">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 sm:gap-3"
          aria-label="Jersey Terminal home"
          onClick={() => setMobileOpen(false)}
        >
          <BrandLogo
            variant="mark"
            priority
            className="h-11 w-11 shrink-0 transition-transform duration-500 group-hover:rotate-[-4deg] group-hover:scale-[1.04] sm:h-12 sm:w-12"
          />
          <span className="hidden truncate jt-display text-xl leading-none text-white transition-all duration-500 group-hover:jt-gradient-text md:inline md:text-2xl">
            JERSEY TERMINAL
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Primary">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/shop" && pathname.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "jt-link text-[13px] font-semibold uppercase tracking-[0.18em] transition-colors",
                  active ? "text-jt-neon" : "text-white/80 hover:text-white",
                )}
              >
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-[2px] left-0 h-[2px] w-full jt-gradient-bg"
                    transition={{ type: "spring", stiffness: 400, damping: 36 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/shop"
            className="rounded-full p-2.5 text-jt-muted transition hover:bg-white/5 hover:text-white"
            aria-label="Search shop"
          >
            <Search className="h-5 w-5" />
          </Link>
          <Link
            href="/account"
            className="hidden rounded-full p-2.5 text-jt-muted transition hover:bg-white/5 hover:text-white sm:inline-flex"
            aria-label="Account"
          >
            <User className="h-5 w-5" />
          </Link>
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            onClick={toggle}
            className="relative rounded-full p-2.5 text-jt-muted transition hover:bg-white/5 hover:text-white"
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.4, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 22 }}
                  className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full jt-gradient-bg px-1 text-[10px] font-bold text-jt-black shadow-[0_0_12px_rgba(180,255,26,0.8)]"
                >
                  {count}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
          <button
            type="button"
            className="rounded-full p-2.5 text-white lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 bg-jt-black/95 backdrop-blur-xl lg:hidden"
            aria-label="Mobile"
          >
            <ul className="jt-container flex max-h-[calc(100svh-4rem)] flex-col overflow-y-auto py-3">
              {[...links, { href: "/account", label: "Account" }].map((l, i) => (
                <motion.li
                  key={l.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.35 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between border-b border-white/5 py-4 jt-display text-3xl text-white transition-colors hover:text-jt-neon"
                  >
                    {l.label}
                    <span className="jt-gradient-text-fire jt-display text-base">{String(i + 1).padStart(2, "0")}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
