import type { Metadata } from "next";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { CUSTOM_MOQ } from "@/lib/custom-order";
import { getStorefrontContact } from "@/lib/storefront-contact";

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "Terms for Jersey Terminal retail and custom kit orders.",
};

export default async function TermsPage() {
  const contact = await getStorefrontContact();
  const email = contact.email || "the contact page";

  return (
    <div className="jt-page jt-container max-w-3xl">
      <SplitHeading as="h1" text="Terms of sale" className="jt-display text-4xl tracking-wide sm:text-5xl" />
      <Reveal delay={0.08}>
        <div className="prose prose-invert mt-6 max-w-none text-sm text-white/70">
          <p>
            By placing an order with Jersey Terminal you agree to these terms. Prices are in AED unless stated
            otherwise. Contact {email} for questions.
          </p>
          <h2>Retail jerseys</h2>
          <p>
            Ready-made items ship after payment confirmation. Personalised name/number prints are made to order
            and cannot be cancelled once production starts.
          </p>
          <h2>Custom team kits</h2>
          <p>
            Minimum order quantity is {CUSTOM_MOQ} jerseys. Design deposit or full payment confirms the brief.
            Artwork proofs must be approved in writing before bulk print. Lead times are estimates and may move
            with fabric availability.
          </p>
          <h2>Shipping &amp; duties</h2>
          <p>
            UAE, GCC, and international zones are listed at checkout / on the custom freight step. International
            orders may incur import duties (typically DAP) payable by the recipient.
          </p>
          <h2>Liability</h2>
          <p>
            Our liability is limited to the amount paid for the affected order. We are not responsible for
            courier delays outside our control or for typos on personalised prints once you approve the spelling.
          </p>
        </div>
      </Reveal>
    </div>
  );
}
