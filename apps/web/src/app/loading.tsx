import Image from "next/image";

/** Lightweight route loader — avoid backdrop-blur (expensive on mid-range phones). */
export default function Loading() {
  return (
    <div className="fixed inset-0 z-[180] grid place-items-center overflow-hidden bg-jt-black/95">
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(180,255,26,0.12),transparent_42%)]"
      />
      <div className="relative flex flex-col items-center gap-4">
        <div className="relative grid h-20 w-20 place-items-center">
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
          <div className="jt-chamfer relative z-10 grid h-14 w-14 place-items-center bg-jt-black ring-1 ring-white/10">
            <Image
              src="/brand/jt-mark.png"
              alt="Jersey Terminal"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
        </div>
        <p className="jt-display text-sm tracking-wide text-white/80">Loading</p>
      </div>
    </div>
  );
}
