"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  distance?: number;
  xDistance?: number;
  scale?: number;
};

/** Passthrough — scroll-linked parallax was recalculating transforms every frame. */
export function ScrollParallax({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}
