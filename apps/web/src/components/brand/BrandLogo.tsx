import Image from "next/image";
import { cn } from "@/lib/format";

type Props = {
  variant?: "mark" | "lockup";
  className?: string;
  priority?: boolean;
};

/**
 * Official Jersey Terminal logo.
 * - mark: emblem only (header / compact)
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
        className={cn("w-auto object-contain", className)}
        style={{ width: "auto" }}
      />
    );
  }

  return (
    <span
      className={cn(
        "relative inline-block overflow-hidden bg-transparent",
        className,
      )}
    >
      <Image
        src="/brand/jt-logo.png"
        alt="Jersey Terminal"
        fill
        sizes="48px"
        priority={priority}
        className="scale-[1.35] object-cover object-[center_18%]"
      />
    </span>
  );
}
