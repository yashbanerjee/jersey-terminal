"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
};

/** Chrome renders immediately so the header is usable on first paint. */
export function FadeIn({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}
