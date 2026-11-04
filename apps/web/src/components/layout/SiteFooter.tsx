import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Reveal } from "@/components/motion/Reveal";

const shop = [
  { href: "/shop/jerseys", label: "Jerseys" },
  { href: "/shop/match-kits", label: "Match Kits" },
  { href: "/shop/training-wear", label: "Training Wear" },
  { href: "/shop/limited-editions", label: "Limited Editions" },
  { href: "/shop/sale", label: "Sale" },
];

const support = [
  { href: "/track", label: "Track order" },
  { href: "/account", label: "Account" },
  { href: "/shipping", label: "Shipping & customs" },
  { href: "mailto:support@yourdomain.com", label: "Contact", external: true },
];

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-jt-black/80 backdrop-blur-sm">
      <div className="jt-divider pointer-events-none absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(180,255,26,0.14),transparent_50%),radial-gradient(ellipse_at_85%_10%,rgba(255,122,26,0.2),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(46,230,255,0.1),transparent_50%)]" />
      <div className="jt-grain pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative jt-container py-8 sm:py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          {/* Brand */}
          <Reveal>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <BrandLogo variant="mark" className="h-11 w-11 sm:h-12 sm:w-12" />
              <span className="jt-display text-2xl tracking-wide sm:text-3xl">JERSEY TERMINAL</span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-jt-muted sm:mt-4">
              Premium sports merchandise for athletes and fans across the UAE and the world.
              Official-style kits, limited drops, and training essentials.
            </p>
            <Link
              href="/shop"
              className="group jt-slant mt-4 inline-flex items-center gap-2 bg-jt-neon/12 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-jt-neon transition-all hover:bg-jt-neon hover:text-jt-black sm:mt-6 sm:text-sm"
            >
              Shop the collection
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>

          {/* Link columns — 2-up on mobile to avoid a tall stack */}
          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:contents">
            <Reveal delay={0.08}>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-jt-neon sm:mb-4 sm:text-xs">
                Shop
              </h3>
              <ul className="space-y-2 text-sm text-jt-muted sm:space-y-2.5">
                {shop.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="jt-link inline-block transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={0.12}>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-jt-orange sm:mb-4 sm:text-xs">
                Support
              </h3>
              <ul className="space-y-2 text-sm text-jt-muted sm:space-y-2.5">
                {support.map((l) => (
                  <li key={l.href}>
                    {"external" in l && l.external ? (
                      <a href={l.href} className="jt-link inline-block transition-colors hover:text-white">
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className="jt-link inline-block transition-colors hover:text-white">
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>

      {/* Giant wordmark — desktop only; on mobile it creates a large empty band */}
      <div className="relative hidden overflow-hidden md:block">
        <div className="jt-container">
          <Reveal y={40}>
            <p
              aria-hidden
              className="jt-gradient-text-aurora -mb-[0.1em] select-none whitespace-nowrap jt-display text-[clamp(3rem,9.6vw,11rem)] leading-none opacity-30"
            >
              JERSEY TERMINAL
            </p>
          </Reveal>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="jt-container flex flex-col gap-1.5 py-4 text-center text-[11px] text-jt-muted sm:flex-row sm:items-center sm:justify-between sm:gap-2 sm:py-5 sm:text-left sm:text-xs">
          <span>© {new Date().getFullYear()} Jersey Terminal. All rights reserved.</span>
          <span>Prices in AED · UAE &amp; worldwide shipping</span>
        </div>
      </div>
    </footer>
  );
}
