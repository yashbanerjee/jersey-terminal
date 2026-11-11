import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";
import { Reveal } from "@/components/motion/Reveal";
import { SITE, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/lib/site";

const shop = [
  { href: "/shop/jerseys", label: "Jerseys" },
  { href: "/custom", label: "Custom kits" },
  { href: "/shop/training-wear", label: "Training Wear" },
];

const support = [
  { href: "/track", label: "Track order" },
  { href: "/account", label: "Account" },
  { href: "/shipping", label: "Shipping & customs" },
  { href: "/contact", label: "Contact" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="relative w-full overflow-hidden border-t border-white/10 bg-jt-black/80 backdrop-blur-sm">
      <div className="jt-divider pointer-events-none absolute inset-x-0 top-0" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(180,255,26,0.14),transparent_50%),radial-gradient(ellipse_at_85%_10%,rgba(255,122,26,0.2),transparent_50%),radial-gradient(ellipse_at_50%_100%,rgba(46,230,255,0.1),transparent_50%)]" />
      <div className="jt-grain pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative jt-container py-8 sm:py-10 md:py-14">
        <div className="grid gap-8 md:grid-cols-[1.4fr_1fr_1fr] md:gap-10">
          <Reveal>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <BrandLogo variant="mark" className="h-12 w-12 sm:h-14 sm:w-14" />
              <span className="jt-display text-xl leading-none tracking-wide sm:text-2xl md:text-3xl">
                Jersey Terminal
              </span>
            </div>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-jt-muted sm:mt-4">
              Match and training kits for UAE clubs and fans — ready-to-wear United Tigers jerseys plus
              custom team kits from MOQ 15.
            </p>
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-6">
              <Link
                href="/shop"
                className="group jt-slant inline-flex items-center gap-2 bg-jt-neon/12 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-jt-neon transition-all duration-300 hover:-translate-y-0.5 hover:bg-jt-neon hover:text-jt-black"
              >
                Shop the collection
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <a
                href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-[#25D366]/40 bg-[#25D366]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#25D366]"
              >
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
            </div>
            <p className="mt-3 text-xs text-jt-muted">
              {SITE.email} · {SITE.phoneDisplay} · {SITE.city}
            </p>
          </Reveal>

          <div className="grid grid-cols-2 gap-6 sm:gap-8 md:contents">
            <Reveal delay={0.08}>
              <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-jt-neon sm:mb-4 sm:text-xs">
                Shop
              </h3>
              <ul className="space-y-2 text-sm text-jt-muted sm:space-y-2.5">
                {shop.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="jt-link inline-block transition-all duration-300 hover:translate-x-1 hover:text-white">
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
                    <Link href={l.href} className="jt-link inline-block transition-all duration-300 hover:translate-x-1 hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="relative hidden overflow-hidden md:block">
        <div className="jt-container">
          <Reveal y={48} idle="float" effect="blur">
            <p
              aria-hidden
              className="jt-gradient-text-aurora -mb-[0.1em] select-none whitespace-nowrap jt-display text-[clamp(3rem,9.6vw,11rem)] leading-none opacity-35 transition-opacity duration-500 hover:opacity-55"
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
