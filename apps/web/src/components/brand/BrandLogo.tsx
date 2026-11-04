import Image from "next/image";
import { cn } from "@/lib/format";

type Props = {
  variant?: "mark" | "lockup";
  className?: string;
  priority?: boolean;
};

/**
 * Official Jersey Terminal logo (same /brand/jt-logo.png asset).
 * - mark: emblem framed for header / compact use (no stretch, no edge clip)
 * - lockup: full mark + wordmark
 */
export function BrandLogo({
  variant = "mark",
  className,
  priority = false,
}: Props) {
  if (variant === "lockup") {
    return (
      <Image
        src="/brand/jt-logo.png"
        alt="Jersey Terminal"
        width={320}
        height={360}
        priority={priority}
        className={cn("h-auto w-auto max-h-full object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 overflow-hidden rounded-2xl bg-jt-black",
        "ring-1 ring-jt-neon/40 shadow-[0_0_28px_-8px_rgba(180,255,26,0.65)]",
        className,
      )}
    >
      {/*
        The PNG is a full lockup (mark + wordmark). Frame the emblem with
        object-cover + a top-biased position — never scale past 1, which was
        clipping the circle top/bottom and making it look stretched.
      */}
      <Image
        src="/brand/jt-logo.png"
        alt="Jersey Terminal"
        fill
        sizes="56px"
        priority={priority}
        className="object-cover object-[center_16%]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-jt-neon/10 via-transparent to-jt-orange/10"
      />
    </span>
  );
}
