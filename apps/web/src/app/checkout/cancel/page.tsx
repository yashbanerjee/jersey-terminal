import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="jt-page jt-container w-full max-w-2xl text-center">
      <h1 className="jt-display text-5xl tracking-wide">
        Payment cancelled
      </h1>
      <p className="mt-4 text-sm text-jt-muted">
        No payment was captured. Your cart is still available.
      </p>
      <Link
        href="/checkout"
        className="jt-gradient-bg mt-8 inline-block px-5 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
      >
        Return to checkout
      </Link>
    </div>
  );
}
