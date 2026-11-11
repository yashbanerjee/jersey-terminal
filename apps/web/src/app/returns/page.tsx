import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Returns & Exchanges",
  description: "Return policy for Jersey Terminal stock and personalised goods.",
};

export default function ReturnsPage() {
  return (
    <div className="jt-page jt-container max-w-3xl">
      <SplitHeading as="h1" text="Returns & exchanges" className="jt-display text-4xl tracking-wide sm:text-5xl" />
      <Reveal delay={0.08}>
        <div className="prose prose-invert mt-6 max-w-none text-sm text-white/70">
          <h2>Ready-made stock (no print)</h2>
          <p>
            Unworn, unwashed items with tags may be exchanged within 7 days of delivery for size issues. Email{" "}
            {SITE.email} with your order number and photos of the garment.
          </p>
          <h2>Personalised &amp; custom kits</h2>
          <p>
            Name/number prints and full custom team kits are made to order. They cannot be returned unless we
            made a production error against an approved proof. Always check spelling and sizes before paying or
            approving artwork.
          </p>
          <h2>Damaged in transit</h2>
          <p>
            Report damage within 48 hours of delivery with unboxing photos. We will replace or refund the
            affected pieces.
          </p>
          <p>
            Need help? <Link href="/contact">Contact page</Link> or WhatsApp from the site button.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
