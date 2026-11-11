import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { SITE, WHATSAPP_DEFAULT_MESSAGE, whatsappUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Jersey Terminal for ready jerseys and custom team kits in the UAE.",
};

export default function ContactPage() {
  return (
    <div className="jt-page jt-container max-w-3xl">
      <Reveal>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-jt-neon">Support</p>
      </Reveal>
      <SplitHeading as="h1" text="Contact us" className="jt-display text-4xl tracking-wide sm:text-5xl" />
      <Reveal delay={0.08}>
        <p className="mt-4 text-sm leading-relaxed text-white/70">
          Questions on United Tigers stock, sizing, shipping, or a custom club kit? Message us on WhatsApp for
          the fastest reply — usually same day in UAE business hours.
        </p>
        <div className="mt-8 space-y-4 border border-white/10 bg-white/[0.03] p-5 text-sm text-white/75">
          <p>
            Email:{" "}
            <a className="text-jt-neon hover:underline" href={`mailto:${SITE.email}`}>
              {SITE.email}
            </a>
          </p>
          <p>Phone: {SITE.phoneDisplay}</p>
          <p>Based in {SITE.city}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={whatsappUrl(WHATSAPP_DEFAULT_MESSAGE)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#25D366] px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
          <Link
            href="/custom"
            className="inline-flex border border-white/20 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white"
          >
            Start custom kit
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
