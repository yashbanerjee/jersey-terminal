import { BadgeCheck, PenLine, ShieldCheck, Truck } from "lucide-react";
import { StaggerGroup, StaggerItem } from "@/components/motion/Reveal";

type Accent = {
  tile: string;
  hoverTile: string;
  hoverBorder: string;
  hoverGlow: string;
};

const ACCENTS: Record<"lime" | "cyan" | "orange" | "yellow", Accent> = {
  lime: {
    tile: "bg-jt-neon/12 text-jt-neon",
    hoverTile: "group-hover:jt-gradient-bg group-hover:text-jt-black",
    hoverBorder: "hover:border-jt-neon/50",
    hoverGlow: "hover:shadow-[0_20px_50px_-25px_rgba(180,255,26,0.6)]",
  },
  cyan: {
    tile: "bg-jt-cyan/12 text-jt-cyan",
    hoverTile: "group-hover:bg-jt-cyan group-hover:text-jt-black",
    hoverBorder: "hover:border-jt-cyan/50",
    hoverGlow: "hover:shadow-[0_20px_50px_-25px_rgba(46,230,255,0.6)]",
  },
  orange: {
    tile: "bg-jt-orange/15 text-jt-orange",
    hoverTile: "group-hover:jt-gradient-bg-fire group-hover:text-jt-black",
    hoverBorder: "hover:border-jt-orange/60",
    hoverGlow: "hover:shadow-[0_20px_50px_-25px_rgba(255,122,26,0.7)]",
  },
  yellow: {
    tile: "bg-jt-lime/12 text-jt-lime",
    hoverTile: "group-hover:bg-jt-lime group-hover:text-jt-black",
    hoverBorder: "hover:border-jt-lime/50",
    hoverGlow: "hover:shadow-[0_20px_50px_-25px_rgba(217,255,61,0.6)]",
  },
};

const FEATURES = [
  { icon: Truck, title: "Fast UAE delivery", text: "1–3 working days across all seven emirates.", accent: "lime" as const },
  { icon: ShieldCheck, title: "Secure payment", text: "Pay securely by card with Stripe.", accent: "cyan" as const },
  { icon: PenLine, title: "Make it yours", text: "Add your name and number to any jersey.", accent: "orange" as const },
  { icon: BadgeCheck, title: "Premium quality", text: "Breathable fabrics, match-ready finish.", accent: "yellow" as const },
];

export function FeatureStrip() {
  return (
    <section className="w-full py-6 sm:py-8">
      <div className="jt-container">
        <div className="jt-divider mb-6 sm:mb-8" />
        <StaggerGroup effect="3d" className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-6">
          {FEATURES.map(({ icon: Icon, title, text, accent }) => {
            const a = ACCENTS[accent];
            return (
              <StaggerItem key={title} effect="3d">
                <div
                  className={`group flex h-full gap-3 jt-chamfer-sm border border-white/8 bg-white/[0.03] p-4 backdrop-blur transition-all duration-500 hover:-translate-y-1 hover:bg-white/[0.06] sm:p-5 ${a.hoverBorder} ${a.hoverGlow}`}
                >
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center jt-slant-sm transition-all duration-500 group-hover:scale-110 group-hover:rotate-[-6deg] ${a.tile} ${a.hoverTile}`}
                  >
                    <Icon className="h-5 w-5 transition-transform duration-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-snug text-white">{title}</p>
                    <p className="mt-1 text-pretty text-xs leading-relaxed text-jt-muted">{text}</p>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
        <div className="jt-divider mt-6 sm:mt-8" />
      </div>
    </section>
  );
}
