"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, MessageCircle, Search, ShoppingBag, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { FadeIn } from "@/components/motion/FadeIn";
import { HoverScramble } from "@/components/motion/HoverScramble";
import { lockScroll } from "@/components/motion/SmoothScroll";
import { useCartStore } from "@/store/cart";
import { useWhatsAppHref } from "@/components/layout/ContactProvider";
import { cn } from "@/lib/format";

const links = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/jerseys", label: "Jerseys" },
  { href: "/custom", label: "Custom" },
  { href: "/shop/training-wear", label: "Training" },
  { href: "/track", label: "Track" },
];

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, toggle } = useCartStore();
  const pathname = usePathname();
  const whatsappHref = useWhatsAppHref();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    lockScroll(mobileOpen);
    return () => lockScroll(false);
  }, [mobileOpen]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
        scrolled || mobileOpen
          ? "border-white/10 bg-jt-black/95 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.9),0_1px_0_0_rgba(180,255,26,0.08)]"
          : "border-transparent bg-transparent",
      )}
    >

      <div className="jt-container flex h-16 items-center justify-between md:h-20">
        <FadeIn delay={0.05} y={10}>
          <Link
            href="/"
            className="group flex min-w-0 items-center gap-2.5 sm:gap-3"
            aria-label="Jersey Terminal home"
            onClick={() => setMobileOpen(false)}
          >
            <BrandLogo
              variant="mark"
              priority
              className="transition-transform duration-500 group-hover:rotate-[-3deg] group-hover:scale-[1.05]"
            />
            <HoverScramble
              text="Jersey Terminal"
              className="truncate jt-display text-lg leading-none tracking-wide text-white transition-all duration-300 group-hover:jt-gradient-text sm:text-xl md:text-2xl"
            />
          </Link>
        </FadeIn>

        <nav className="hidden items-center gap-7 lg:flex xl:gap-9" aria-label="Primary">
          {links.map((l, i) => {
            const active = pathname === l.href || (l.href !== "/shop" && pathname.startsWith(l.href));
            return (
              <FadeIn key={l.href} delay={0.08 + i * 0.04} y={8} scale={0.98}>
                <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 400, damping: 24 }}>
                  <Link
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
                </motion.div>
              </FadeIn>
            );
          })}
        </nav>

        <FadeIn delay={0.2} y={8} className="flex items-center gap-1 sm:gap-2">
          {whatsappHref && (
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="hidden sm:inline-flex">
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full p-2.5 text-[#25D366] transition hover:bg-[#25D366]/10"
                aria-label="WhatsApp"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
            </motion.div>
          )}
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}>
            <Link
              href="/shop#search"
              className="rounded-full p-2.5 text-jt-muted transition hover:bg-white/5 hover:text-white"
              aria-label="Search shop"
            >
              <Search className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} className="hidden sm:inline-flex">
            <Link
              href="/account"
              className="rounded-full p-2.5 text-jt-muted transition hover:bg-white/5 hover:text-white"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>
          </motion.div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.08 }}
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
          <motion.button
            type="button"
            whileTap={{ scale: 0.9 }}
            className="rounded-full p-2.5 text-white lg:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={mobileOpen ? "x" : "menu"}
                initial={{ opacity: 0, rotate: -40, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 40, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                className="grid place-items-center"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </motion.button>
        </FadeIn>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            key="mobile-nav"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/5 bg-jt-black lg:hidden"
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
                    className="flex items-center justify-between border-b border-white/5 py-4 jt-display text-3xl text-white transition-all duration-300 hover:translate-x-1 hover:text-jt-neon"
                  >
                    {l.label}
                    <span className="jt-gradient-text-fire jt-display text-base transition-transform duration-300 group-hover:scale-110">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
