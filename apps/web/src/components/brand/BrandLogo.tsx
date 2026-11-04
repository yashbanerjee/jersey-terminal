import Image from "next/image";
import { cn } from "@/lib/format";

type Props = {
  variant?: "mark" | "lockup";
  className?: string;
  priority?: boolean;
};

/**
 * Jersey Terminal logo.
 * - mark: circular JT emblem (`jt-mark.png`)
 * - lockup: full lockup PNG (mark + wordmark)
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
        height={240}
        priority={priority}
        className={cn("h-auto w-auto max-h-full object-contain", className)}
      />
    );
  }

  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-jt-black sm:h-12 sm:w-12",
        "ring-1 ring-jt-neon/35 shadow-[0_0_26px_-6px_rgba(180,255,26,0.7)]",
        className,
      )}
    >
      {/*
        Emblem touches the PNG edges — pad + mild zoom so the circle reads
        sharp in the header without top/bottom clipping or stretch.
      */}
      <Image
        src="/brand/jt-mark.png"
        alt="Jersey Terminal"
        fill
        sizes="56px"
        priority={priority}
        className="object-contain object-center p-[7%] scale-[1.08]"
      />
    </span>
  );
}
