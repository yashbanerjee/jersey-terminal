import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";
import { AddToCartPanel } from "@/components/product/AddToCartPanel";
import { ProductGrid } from "@/components/product/ProductGrid";
import {
  getProductBySlug,
  getProductExtensions,
  getProductVariations,
  listProducts,
  toCard,
} from "@/lib/woo/products";
import { displayCategory } from "@/lib/woo/store-map";

export const revalidate = 60;

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [variations, extensions, related] = await Promise.all([
    getProductVariations(product.id),
    getProductExtensions(product.id),
    listProducts({ perPage: 5, orderby: "popularity" }),
  ]);

  return (
    <div className="jt-page jt-container w-full">
      <Reveal y={8}>
        <Link
          href="/shop"
          className="group mb-5 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-jt-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to shop
        </Link>
      </Reveal>

      <div className="grid w-full gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
        <Reveal className="space-y-3" y={24}>
          <div className="jt-card jt-glow-border group relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-jt-surface ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(164,255,20,0.35)] sm:aspect-[3/4]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(164,255,20,0.2),rgba(139,92,246,0.12)_45%,transparent_70%)] blur-3xl" />
            {product.images[0] ? (
              <div className="jt-card-media absolute inset-0">
                <Image
                  src={product.images[0].src}
                  alt={product.images[0].alt || product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width:1024px) 100vw, 50vw"
                />
              </div>
            ) : null}
            <span aria-hidden className="jt-card-shine pointer-events-none absolute inset-0" />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.images.slice(1, 5).map((img) => (
                <div
                  key={img.id}
                  className="relative aspect-square overflow-hidden rounded-lg bg-jt-surface ring-1 ring-white/10 transition-transform duration-300 hover:scale-[1.03]"
                >
                  <Image src={img.src} alt={img.alt || product.name} fill className="object-cover" sizes="25vw" />
                </div>
              ))}
            </div>
          )}
        </Reveal>

        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <Reveal y={10}>
            <p className="text-[11px] uppercase tracking-[0.3em] text-jt-neon">{displayCategory(product.categories)}</p>
          </Reveal>
          <SplitHeading
            as="h1"
            text={product.name}
            className="mt-2 jt-display text-5xl leading-[0.92] tracking-wide sm:text-6xl md:text-7xl"
          />
          <Reveal y={12} delay={0.15}>
            <div
              className="prose prose-invert mt-5 max-w-none text-sm text-jt-muted sm:mt-6"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          </Reveal>
          <Reveal y={16} delay={0.25}>
            <div className="mt-6 sm:mt-8">
              <AddToCartPanel product={product} variations={variations} personalization={extensions} />
            </div>
          </Reveal>
          <Reveal y={12} delay={0.3}>
            <div
              className="prose prose-invert mt-8 max-w-none text-sm text-jt-muted sm:mt-10"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          </Reveal>
        </div>
      </div>

      <section className="mt-14 w-full sm:mt-20">
        <Reveal y={10}>
          <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-jt-neon">Complete the look</p>
        </Reveal>
        <SplitHeading
          text="You may also like"
          className="mb-6 jt-display text-4xl leading-[0.95] tracking-wide sm:text-5xl"
        />
        <ProductGrid
          products={
            related.length ? related.filter((p) => p.id !== product.id).slice(0, 6) : [toCard(product)]
          }
        />
      </section>
    </div>
  );
}
