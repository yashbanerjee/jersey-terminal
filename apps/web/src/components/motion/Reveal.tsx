"use client";

import type { ReactNode } from "react";

export type RevealEffect = "up" | "down" | "left" | "right" | "scale" | "3d" | "blur" | "pop" | "clip";
export type RevealIdle = false | "float" | "sway" | "pulse" | "breathe";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  once?: boolean;
  effect?: RevealEffect;
  idle?: RevealIdle;
};

/**
 * Content is painted immediately (United Tigers style).
 * Scroll-triggered fades were hiding the page and making arrival feel laggy.
 */
export function Reveal({ children, className }: Props) {
  return <div className={className}>{children}</div>;
}

export function StaggerGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  once?: boolean;
}) {
  return <div className={className}>{children}</div>;
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  idle?: RevealIdle;
  phase?: number;
}) {
  return <div className={className}>{children}</div>;
}
