"use client";

import type { ReactNode } from "react";

type IdleKind = "float" | "sway" | "pulse" | "breathe";

type Props = {
  children: ReactNode;
  className?: string;
  kind?: IdleKind;
  delay?: number;
  phase?: number;
};

/** Passthrough — perpetual idle loops were keeping the compositor busy while scrolling. */
export function IdleMotion({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}
