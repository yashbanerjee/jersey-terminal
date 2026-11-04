import Link from "next/link";

export default function OrdersPage() {
  return (
    <div className="jt-page jt-container w-full max-w-4xl">
      <h1 className="jt-display text-5xl tracking-wide">
        Orders
      </h1>
      <p className="mt-4 text-sm text-jt-muted">
        Sign in to load order history from WooCommerce customer endpoints.
        Guest tracking is available on the{" "}
        <Link href="/track" className="text-jt-neon">
          tracking page
        </Link>
        .
      </p>
    </div>
  );
}
