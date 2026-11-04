import Link from "next/link";
import { NeonBurst } from "@/components/motion/NeonBurst";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  return (
    <div className="jt-page jt-container relative w-full max-w-2xl overflow-hidden text-center">
      <NeonBurst />
      <p className="relative z-10 text-xs uppercase tracking-[0.24em] text-jt-neon">Thank you</p>
      <h1 className="relative z-10 mt-3 jt-display text-5xl tracking-wide">Order received</h1>
      <p className="relative z-10 mt-4 text-sm text-jt-muted">
        Your payment is being confirmed by Stripe. You&apos;ll receive an email as soon as the order is
        confirmed.
      </p>
      {order && (
        <p className="relative z-10 mt-4 text-lg text-white">
          Order reference: <span className="text-jt-neon">#{order}</span>
        </p>
      )}
      <div className="relative z-10 mt-8 flex justify-center gap-4">
        <Link
          href={`/track${order ? `?order=${order}` : ""}`}
          className="jt-gradient-bg px-5 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
        >
          Track shipment
        </Link>
        <Link href="/account" className="border border-white/20 px-5 py-3 text-sm uppercase tracking-wider">
          Account
        </Link>
      </div>
    </div>
  );
}
