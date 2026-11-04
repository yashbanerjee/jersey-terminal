import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

export function PageHeading({
  eyebrow,
  title,
  description,
  count,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <Reveal effect="blur" y={10}>
            <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-jt-neon">{eyebrow}</p>
          </Reveal>
        )}
        <SplitHeading
          as="h1"
          text={title}
          className="jt-display text-5xl leading-[0.92] tracking-wide sm:text-6xl md:text-7xl"
        />
        {description && (
          <Reveal effect="up" y={10} delay={0.15}>
            <p className="mt-3 max-w-xl text-sm text-jt-muted sm:text-base">{description}</p>
          </Reveal>
        )}
      </div>
      {typeof count === "number" && (
        <Reveal effect="right" y={10} delay={0.2}>
          <p className="text-xs uppercase tracking-[0.2em] text-jt-muted">
            <span className="jt-display text-2xl text-white">{count}</span> items
          </p>
        </Reveal>
      )}
    </div>
  );
}
