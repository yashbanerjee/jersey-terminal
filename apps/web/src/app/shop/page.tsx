import { Search } from "lucide-react";
import Link from "next/link";
import { PageHeading } from "@/components/layout/PageHeading";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { ProductGrid } from "@/components/product/ProductGrid";
import { getCategories, listProducts } from "@/lib/woo/products";

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const [products, categories] = await Promise.all([
    listProducts({ search: q, perPage: 24, orderby: "date" }),
    getCategories(),
  ]);

  return (
    <div className="jt-page jt-container w-full">
      <PageHeading
        eyebrow="Jersey Terminal"
        title={q ? `Results for "${q}"` : "Shop all"}
        description="Jerseys, kits, training and limited drops — every style we carry, in one place."
        count={products.length}
      />

      <div className="mt-6 flex flex-col gap-4 sm:mt-8 lg:flex-row lg:items-center lg:justify-between">
        <StaggerGroup className="jt-chip-row">
          <StaggerItem>
            <Link
              href="/shop"
              className="jt-chip rounded-full border border-jt-neon bg-jt-neon/10 px-4 py-2 text-xs uppercase tracking-[0.16em] text-jt-neon transition hover:scale-105"
            >
              All
            </Link>
          </StaggerItem>
          {categories.map((c) => (
            <StaggerItem key={c.id}>
              <Link
                href={`/shop/${c.slug}`}
                className="jt-chip rounded-full border border-white/15 px-4 py-2 text-xs uppercase tracking-[0.16em] text-jt-muted transition-colors hover:border-jt-neon/60 hover:text-white hover:scale-105"
              >
                {c.name}
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal effect="right" delay={0.2} className="relative w-full lg:max-w-sm">
          <form className="relative w-full">
            <label className="sr-only" htmlFor="q">
              Search
            </label>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-jt-muted" />
            <input
              id="q"
              name="q"
              defaultValue={q}
              placeholder="Search jerseys"
              className="min-h-12 w-full rounded-full border border-white/15 bg-white/[0.03] pl-11 pr-4 text-sm outline-none transition-colors focus:border-jt-neon"
            />
          </form>
        </Reveal>
      </div>

      <ProductGrid
        className="mt-8 sm:mt-10"
        products={products}
        emptyText={q ? `Nothing matched "${q}". Try another search.` : "No products yet. Publish catalog items in WooCommerce."}
      />
    </div>
  );
}
