import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { getStorefrontContact } from "@/lib/storefront-contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Jersey Terminal collects and uses personal data.",
};

export default async function PrivacyPage() {
  const contact = await getStorefrontContact();
  const email = contact.email || "the contact page";

  return (
    <div className="jt-page jt-container max-w-3xl">
      <SplitHeading as="h1" text="Privacy policy" className="jt-display text-4xl tracking-wide sm:text-5xl" />
      <Reveal delay={0.08}>
        <div className="prose prose-invert mt-6 max-w-none text-sm text-white/70">
          <p>
            Jersey Terminal (“we”) processes order, account, and support data to fulfil purchases, ship kits,
            and answer sales enquiries. Contact: {email}.
          </p>
          <h2>What we collect</h2>
          <p>
            Name, email, phone, shipping address, cart contents, custom kit briefs (team name, logo, roster,
            sponsors), and payment status from Stripe. We do not store full card numbers.
          </p>
          <h2>How we use it</h2>
          <p>
            Order fulfilment, design proofs for custom kits, delivery updates, fraud prevention, and optional
            marketing if you join the newsletter.
          </p>
          <h2>Sharing</h2>
          <p>
            Payment processors (Stripe), hosting (Railway), CMS/WooCommerce, and courier partners as needed to
            deliver your order. WhatsApp chats are handled on Meta’s platform when you message us.
          </p>
          <h2>Retention</h2>
          <p>
            Order and kit briefs are kept for accounting and reprint requests. You may request access or
            deletion at {email}, subject to legal retention duties.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
