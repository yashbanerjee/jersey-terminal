"use client";

type Props = {
  count: number;
  index: number;
  durationMs?: number;
  paused?: boolean;
  onSelect?: (index: number) => void;
  labels?: string[];
  className?: string;
  tone?: "lime" | "amber" | "white";
  size?: "hero" | "compact";
};

/**
 * Small circular slide dots — active one fills from bottom → top over the
 * autoplay window (United Tigers–style timer, round form).
 * Animation respects prefers-reduced-motion via globals.css (no JS branch,
 * so SSR and client markup stay identical).
 */
export function ProgressDots({
  count,
  index,
  durationMs = 3000,
  paused = false,
  onSelect,
  labels,
  className = "",
  tone = "lime",
  size = "hero",
}: Props) {
  if (count < 2) return null;

  const fillClass =
    tone === "amber" ? "bg-jt-amber" : tone === "white" ? "bg-white" : "bg-jt-neon";
  const trackClass =
    tone === "amber"
      ? "bg-jt-amber/25 ring-1 ring-jt-amber/40"
      : tone === "white"
        ? "bg-white/20 ring-1 ring-white/35"
        : "bg-jt-neon/20 ring-1 ring-jt-neon/35";
  const glowClass =
    tone === "amber"
      ? "shadow-[0_0_12px_rgba(255,176,32,0.7)]"
      : tone === "white"
        ? "shadow-[0_0_12px_rgba(255,255,255,0.5)]"
        : "shadow-[0_0_12px_rgba(180,255,26,0.75)]";

  const dim = size === "hero" ? "h-2.5 w-2.5 sm:h-3 sm:w-3" : "h-2 w-2";
  const gap = size === "hero" ? "gap-2.5 sm:gap-3" : "gap-2";

  return (
    <div
      className={`flex items-center justify-center ${gap} ${className}`}
      role="tablist"
      aria-label="Slides"
    >
      {Array.from({ length: count }).map((_, i) => {
        const done = i < index;
        const active = i === index;

        return (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={active}
            aria-label={labels?.[i] ?? `Slide ${i + 1} of ${count}`}
            onClick={() => onSelect?.(i)}
            className="relative grid place-items-center p-2"
          >
            <span
              className={`relative block overflow-hidden rounded-full ${dim} ${trackClass} transition-[transform,box-shadow] duration-300 ${
                active ? `scale-125 ${glowClass}` : "hover:scale-110"
              }`}
            >
              {done && <span aria-hidden className={`absolute inset-0 rounded-full ${fillClass}`} />}

              {active && (
                <span
                  key={`fill-${index}`}
                  aria-hidden
                  className={`jt-dot-fill-up absolute inset-x-0 bottom-0 h-full w-full rounded-full ${fillClass}`}
                  style={{
                    animationDuration: `${durationMs}ms`,
                    animationPlayState: paused ? "paused" : "running",
                  }}
                />
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
