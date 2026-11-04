import { Hero } from "@/components/motion/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { LimitedSpotlight } from "@/components/home/LimitedSpotlight";
import { Newsletter } from "@/components/home/Newsletter";
import { PersonaliseBanner } from "@/components/home/PersonaliseBanner";
import { ProductRail } from "@/components/home/ProductRail";
import { Reviews } from "@/components/home/Reviews";
import { TickerStrip } from "@/components/home/TickerStrip";
import { getHomepageCollections } from "@/lib/woo/products";

/**
 * Request-time render so we never bake an empty homepage during Docker builds
 * (private WP host is unreachable at build). Data is still cached via unstable_cache.
 */
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
      <FeatureStrip />

      <ProductRail
        index={1}
        eyebrow="Just landed"
        title="New Arrivals"
        subtitle="Fresh drops for the season — be first on the pitch and the street."
        products={newest}
        href="/shop?sort=date"
        layout="deck+grid"
        limit={8}
      />

      <LimitedSpotlight products={limited} href="/shop/limited-editions" />

      <PersonaliseBanner />

      <BrandStory />

      <ProductRail
        index={2}
        eyebrow="Everything"
        title="All Jerseys"
        subtitle="The full Jersey Terminal collection — browse every cut in one dense drop."
        products={all}
        href="/shop"
        layout="grid"
        limit={12}
      />

      <Reviews />
      <Newsletter />
    </div>
  );
}
