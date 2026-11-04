import { PenLine } from "lucide-react";
import type { CartLine } from "@/store/cart";

/** Compact "what we'll print" line shown under a cart item. */
export function PersonalizationTag({ personalization }: { personalization?: CartLine["personalization"] }) {
  if (!personalization) return null;
  const { playerName, jerseyNumber, customText } = personalization;
  return (
    <div className="mt-2 inline-flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-jt-neon/30 bg-jt-neon/10 px-2 py-1 text-[11px] text-jt-neon">
      <PenLine className="h-3 w-3" />
      <span className="uppercase tracking-[0.14em]">Print:</span>
      {playerName && <span className="font-semibold text-white">{playerName}</span>}
      {jerseyNumber && <span className="font-semibold text-white">#{jerseyNumber}</span>}
      {customText && <span className="text-white/80">“{customText}”</span>}
    </div>
  );
}
