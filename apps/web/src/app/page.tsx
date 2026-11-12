import { Hero } from "@/components/motion/Hero";
import { BrandStory } from "@/components/home/BrandStory";
import { CustomKitTeaser } from "@/components/home/CustomKitTeaser";
import { FeatureStrip } from "@/components/home/FeatureStrip";
import { HomeSection } from "@/components/home/HomeSection";
import { LimitedSpotlight } from "@/components/home/LimitedSpotlight";
import { Newsletter } from "@/components/home/Newsletter";
import { PersonaliseBanner } from "@/components/home/PersonaliseBanner";
import { ProductRail } from "@/components/home/ProductRail";
import { Reviews } from "@/components/home/Reviews";
import { SquadGallery } from "@/components/home/SquadGallery";
import { TickerStrip } from "@/components/home/TickerStrip";
import { getHomepageCollections } from "@/lib/woo/products";

/**
 * Request-time render so we never bake an empty homepage during Docker builds
 * (private WP host is unreachable at build). Data is still cached via unstable_cache.
 */
export const dynamic = "force-dynamic";

const FEATURED_PRIORITY = [
  "united-tiger-match-jersey",
  "united-tiger-training-jersey",
];

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
      <HomeSection>
        <FeatureStrip />
      </HomeSection>

      <HomeSection>
        <ProductRail
          index={1}
          eyebrow="United Tigers"
          title="Ready to wear"
          subtitle="Match and training jerseys in stock — personalise name & number at checkout."
          products={newest.length ? newest : all}
          href="/shop"
          layout="deck+grid"
          limit={8}
        />
      </HomeSection>

      <HomeSection>
        <SquadGallery />
      </HomeSection>

      <HomeSection>
        <LimitedSpotlight products={limited} href="/shop/limited-editions" />
      </HomeSection>

      <HomeSection>
        <CustomKitTeaser />
      </HomeSection>

      <HomeSection>
        <PersonaliseBanner />
      </HomeSection>

      <HomeSection>
        <BrandStory />
      </HomeSection>

      <HomeSection>
        <ProductRail
          index={2}
          eyebrow="Collection"
          title="Shop jerseys"
          subtitle="Current catalogue — more clubs coming. Need a full squad kit? Go custom."
          products={all}
          href="/shop"
          layout="grid"
          limit={12}
        />
      </HomeSection>

      <HomeSection>
        <Reviews />
      </HomeSection>
      <HomeSection>
        <Newsletter />
      </HomeSection>
    </div>
  );
}
