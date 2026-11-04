import { cn } from "@/lib/format";

type Props = {
  items: string[];
  className?: string;
  /** Seconds for one full loop. */
  speed?: number;
  reverse?: boolean;
};

const DOT_COLORS = ["bg-jt-orange", "bg-jt-cyan", "jt-gradient-bg", "bg-jt-amber"];
const TEXT_COLORS = ["text-white", "jt-gradient-text-fire", "text-white", "text-jt-cyan"];

/** Infinite horizontal ticker (CSS-driven, pauses on hover). */
export function Marquee({ items, className, speed = 28, reverse = false }: Props) {
  const row = [...items, ...items];
  return (
    <div className={cn("jt-marquee relative w-full overflow-hidden", className)}>
      <div
        className={cn("jt-marquee-track flex w-max items-center", reverse && "jt-marquee-reverse")}
        style={{ ["--jt-marquee-duration" as string]: `${speed}s` }}
      >
        {row.map((t, i) => (
          <span
            key={`${t}-${i}`}
            className="flex items-center gap-6 pr-6 jt-display text-2xl tracking-[0.1em] sm:text-3xl"
            aria-hidden={i >= items.length}
          >
            <span className={TEXT_COLORS[i % TEXT_COLORS.length]}>{t}</span>
            <span className={`h-2 w-2 rotate-45 ${DOT_COLORS[i % DOT_COLORS.length]}`} />
          </span>
        ))}
      </div>
    </div>
  );
}
