"use client";

import type { ProductCardModel } from "@/lib/woo/types";
import { ProductCard } from "@/components/product/ProductCard";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/format";

export function ProductGrid({
  products,
  className,
  emptyText = "No products in this collection yet.",
}: {
  products: ProductCardModel[];
  className?: string;
  emptyText?: string;
}) {
  if (!products.length) return <p className={cn("text-sm text-jt-muted", className)}>{emptyText}</p>;
  return (
    <StaggerGroup effect="3d" className={cn("jt-product-grid [perspective:1400px]", className)}>
      {products.map((p, i) => (
        <StaggerItem
          key={p.id}
          effect="3d"
          idle="float"
          phase={i % 5}
          className="min-w-0 [transform-style:preserve-3d]"
        >
          <ProductCard product={p} priority={i < 4} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
