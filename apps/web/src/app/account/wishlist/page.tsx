"use client";

import Link from "next/link";
import { useWishlistStore } from "@/store/wishlist";

export default function WishlistPage() {
  const ids = useWishlistStore((s) => s.ids);
  return (
    <div className="jt-page jt-container w-full max-w-4xl">
      <h1 className="jt-display text-5xl tracking-wide">
        Wishlist
      </h1>
      {!ids.length ? (
        <p className="mt-4 text-sm text-jt-muted">
          No saved items. Browse the{" "}
          <Link href="/shop" className="text-jt-neon">
            shop
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-2 text-sm">
          {ids.map((id) => (
            <li key={id} className="border border-white/10 px-4 py-3">
              Product ID {id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
