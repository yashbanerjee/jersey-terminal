import Image from "next/image";

/** Route-level loader while Next streams page data. */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center overflow-hidden bg-jt-black/92 backdrop-blur-md">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(180,255,26,0.14),transparent_42%),radial-gradient(circle_at_70%_65%,rgba(255,122,26,0.16),transparent_40%)]"
      />
      <div className="relative flex flex-col items-center gap-5">
        <div className="relative grid h-24 w-24 place-items-center">
          <span
            aria-hidden
            className="absolute inset-0 animate-spin rounded-full"
            style={{
              background:
                "conic-gradient(from 0deg, rgba(180,255,26,0.95), rgba(46,230,255,0.4), rgba(255,122,26,0.95), rgba(180,255,26,0.95))",
              mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
              WebkitMask:
                "radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 2px))",
              animationDuration: "1.1s",
            }}
          />
          <span
            aria-hidden
            className="absolute inset-[-12px] animate-spin rounded-full border border-white/10 border-b-jt-orange/70"
            style={{ animationDirection: "reverse", animationDuration: "1.8s" }}
          />
          <div className="jt-chamfer relative z-10 grid h-16 w-16 place-items-center bg-jt-black ring-1 ring-white/10">
            <Image
              src="/brand/jt-mark.png"
              alt="Jersey Terminal"
              width={44}
              height={44}
              className="object-contain drop-shadow-[0_0_16px_rgba(180,255,26,0.55)]"
              priority
            />
          </div>
        </div>
        <p className="jt-display text-sm tracking-wide">
          <span className="jt-gradient-text-fire">Loading</span>
        </p>
      </div>
    </div>
  );
}
