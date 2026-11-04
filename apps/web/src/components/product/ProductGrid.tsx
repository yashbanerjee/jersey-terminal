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
    <StaggerGroup effect="3d" className={cn("jt-product-grid", className)}>
      {products.map((p, i) => (
        <StaggerItem key={p.id} effect="3d" className="min-w-0">
          <ProductCard product={p} priority={i < 4} />
        </StaggerItem>
      ))}
    </StaggerGroup>
  );
}
