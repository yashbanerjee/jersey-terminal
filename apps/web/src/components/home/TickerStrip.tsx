import { Marquee } from "@/components/motion/Marquee";

const ITEMS = [
  "Free UAE delivery over AED 250",
  "Personalise name & number",
  "Apple Pay & Google Pay accepted",
  "Worldwide shipping",
  "Limited editions drop weekly",
  "Secure checkout",
];

export function TickerStrip() {
  return (
    <div className="relative w-full overflow-hidden py-3 sm:py-4">
      {/* Gradient hairlines top & bottom */}
      <div className="jt-divider absolute inset-x-0 top-0" />
      <div className="jt-divider absolute inset-x-0 bottom-0" />
      {/* Tinted band */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(139,92,246,0.14),rgba(6,7,13,0.6)_30%,rgba(6,7,13,0.6)_70%,rgba(164,255,20,0.12))] backdrop-blur-sm" />
      <div className="relative">
        <Marquee items={ITEMS} speed={36} />
      </div>
    </div>
  );
}
