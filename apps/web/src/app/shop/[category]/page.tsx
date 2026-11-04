import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeading } from "@/components/layout/PageHeading";
import { Reveal } from "@/components/motion/Reveal";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategories, listProducts } from "@/lib/woo/products";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const categories = await getCategories().catch(() => []);
  const match = categories.find((c) => c.slug === category);
  const products = await listProducts({
    category: match ? String(match.id) : undefined,
    search: match ? undefined : category.replace(/-/g, " "),
    perPage: 24,
  }).catch(() => []);

  return (
    <div className="jt-page jt-container w-full">
      <Reveal y={8}>
        <Link
          href="/shop"
          className="group mb-4 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-jt-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          All collections
        </Link>
      </Reveal>
      <PageHeading eyebrow="Collection" title={match?.name ?? category.replace(/-/g, " ")} count={products.length} />
      <ProductGrid className="mt-8 sm:mt-10" products={products} />
    </div>
  );
}
