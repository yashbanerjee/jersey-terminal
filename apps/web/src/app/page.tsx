import { Hero } from "@/components/motion/Hero";
import { ProductRail } from "@/components/home/ProductRail";
import { TickerStrip } from "@/components/home/TickerStrip";
import { LimitedSpotlight } from "@/components/home/LimitedSpotlight";
import { PersonaliseBanner } from "@/components/home/PersonaliseBanner";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { getHomepageCollections } from "@/lib/woo/products";

/** Always render at request time so Docker builds don't need live Woo/WordPress. */
export const dynamic = "force-dynamic";

const FEATURED_PRIORITY = ["shadow-strike-jersey", "champions-edition", "velocity-jersey", "red-horizon"];

export default async function HomePage() {
  const { newest, limited, all } = await getHomepageCollections().catch(() => ({
    newest: [],
    limited: [],
    all: [],
  }));

  const priorityHits = FEATURED_PRIORITY.map((slug) => all.find((p) => p.slug === slug)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const rest = all.filter((p) => !FEATURED_PRIORITY.includes(p.slug));
  const heroProducts = [...priorityHits, ...rest].slice(0, 6);

  return (
    <div className="w-full">
      <Hero products={heroProducts} />
      <TickerStrip />

      <ProductRail
        index={1}
        eyebrow="Just landed"
        title="New Arrivals"
        subtitle="Fresh drops for the season — be first on the pitch and the street."
        products={newest}
        href="/shop?sort=date"
      />

      <LimitedSpotlight products={limited} href="/shop/limited-editions" />

      <PersonaliseBanner />

      <ProductRail
        index={3}
        eyebrow="Everything"
        title="All Jerseys"
        subtitle="The full Jersey Terminal collection, in one place."
        products={all}
        href="/shop"
      />

      <FeatureStrip />
    </div>
  );
}
