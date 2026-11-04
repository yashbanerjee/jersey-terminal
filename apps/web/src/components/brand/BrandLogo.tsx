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
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden sm:h-12 sm:w-12",
        className,
      )}
    >
      {/*
        Transparent-bg mark — mild pad/zoom so the circle isn't edge-clipped.
      */}
      <Image
        src="/brand/jt-mark.png"
        alt="Jersey Terminal"
        fill
        sizes="56px"
        priority={priority}
        className="object-contain object-center p-[6%] scale-[1.06]"
      />
    </span>
  );
}
