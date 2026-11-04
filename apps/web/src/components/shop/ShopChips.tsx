"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGroup, motion } from "framer-motion";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";
import { cn } from "@/lib/format";

type Cat = { id: number; slug: string; name: string };

/** Shop filter chips — active chip morphs wider with a neon glow. */
export function ShopChips({ categories }: { categories: Cat[] }) {
  const pathname = usePathname();
  const allActive = pathname === "/shop" || pathname === "/shop/";

  return (
    <LayoutGroup id="shop-chips">
      <StaggerGroup className="jt-chip-row">
        <StaggerItem className="shrink-0">
          <ChipLink href="/shop" label="All" active={allActive} />
        </StaggerItem>
        {categories.map((c) => {
          const active = pathname === `/shop/${c.slug}` || pathname.startsWith(`/shop/${c.slug}/`);
          return (
            <StaggerItem key={c.id} className="shrink-0">
              <ChipLink href={`/shop/${c.slug}`} label={c.name} active={active} />
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </LayoutGroup>
  );
}

function ChipLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link href={href} className="relative block">
      {active && (
        <motion.span
          layoutId="shop-chip-glow"
          className="absolute -inset-1 rounded-full bg-jt-neon/25 blur-md"
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        />
      )}
      <motion.span
        layout
        className={cn(
          "jt-chip relative inline-flex items-center justify-center rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.16em] transition-colors",
          active
            ? "border-jt-neon bg-jt-neon text-jt-black shadow-[0_0_28px_-4px_rgba(180,255,26,0.75)]"
            : "border-white/15 bg-white/[0.02] text-jt-muted hover:border-jt-neon/60 hover:bg-jt-neon/10 hover:text-white",
        )}
        animate={active ? { scale: 1.06, paddingLeft: 28, paddingRight: 28 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 24 }}
      >
        {label}
        {active && (
          <motion.span
            layoutId="shop-chip-underline"
            className="absolute inset-x-3 -bottom-0.5 h-px jt-gradient-bg"
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
          />
        )}
      </motion.span>
    </Link>
  );
}
