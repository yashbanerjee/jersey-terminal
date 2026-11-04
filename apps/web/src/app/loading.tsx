import Image from "next/image";

/** Route-level loader while Next streams page data. */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center bg-jt-black/90 backdrop-blur-sm">
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid h-20 w-20 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-spin rounded-full border-2 border-jt-neon/25 border-t-jt-neon"
          />
          <span
            aria-hidden
            className="absolute inset-[-10px] animate-spin rounded-full border border-jt-orange/20 border-b-jt-orange [animation-direction:reverse] [animation-duration:1.4s]"
          />
          <Image
            src="/brand/jt-mark.png"
            alt="Jersey Terminal"
            width={56}
            height={56}
            className="relative z-10 object-contain"
            priority
          />
        </div>
        <p className="text-[10px] uppercase tracking-[0.3em] text-jt-muted">Loading</p>
      </div>
    </div>
  );
}
