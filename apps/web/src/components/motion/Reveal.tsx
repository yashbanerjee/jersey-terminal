"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from "react";

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

function effectClass(effect: RevealEffect) {
  switch (effect) {
    case "left":
      return "jt-reveal-left";
    case "right":
      return "jt-reveal-right";
    case "scale":
    case "pop":
      return "jt-reveal-scale";
    case "3d":
      return "jt-reveal-3d";
    case "clip":
      return "jt-reveal-clip";
    case "down":
      return "jt-reveal-down";
    case "blur":
    case "up":
    default:
      return "jt-reveal-up";
  }
}

function observeInView(el: HTMLElement, once: boolean, onIn: () => void) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    onIn();
    return () => undefined;
  }

  // Safety net: never leave content permanently invisible.
  const failSafe = window.setTimeout(onIn, 1200);

  const io = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      onIn();
      window.clearTimeout(failSafe);
      if (once) io.disconnect();
    },
    { threshold: 0.01, rootMargin: "80px 0px 80px 0px" },
  );
  io.observe(el);

  // If already in view on mount (common for above-the-fold sections), reveal immediately.
  const rect = el.getBoundingClientRect();
  if (rect.top < window.innerHeight && rect.bottom > 0) {
    onIn();
    window.clearTimeout(failSafe);
    if (once) io.disconnect();
  }

  return () => {
    window.clearTimeout(failSafe);
    io.disconnect();
  };
}

/**
 * One-shot scroll entrance via CSS + IntersectionObserver.
 * Fail-safe timeout keeps content visible if the observer never fires.
 */
export function Reveal({
  children,
  className = "",
  delay = 0,
  once = true,
  effect = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeInView(el, once, () => el.classList.add("is-in"));
  }, [once]);

  return (
    <div
      ref={ref}
      className={`jt-reveal ${effectClass(effect)} ${className}`.trim()}
      style={{ "--jt-reveal-delay": `${delay}s` } as CSSProperties}
    >
      {children}
    </div>
  );
}

export function StaggerGroup({
  children,
  className = "",
  effect = "up",
  once = true,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return observeInView(el, once, () => el.classList.add("is-in"));
  }, [once]);

  const items = Children.map(children, (child, i) => {
    if (!isValidElement(child)) return child;
    return cloneElement(child as ReactElement<{ style?: CSSProperties; "data-i"?: number }>, {
      "data-i": i,
      style: {
        ...((child.props as { style?: CSSProperties }).style ?? {}),
        "--jt-stagger-i": i,
      } as CSSProperties,
    });
  });

  return (
    <div
      ref={ref}
      className={`jt-stagger ${effect === "3d" ? "jt-stagger-3d" : "jt-stagger-up"} ${className}`.trim()}
    >
      {items}
    </div>
  );
}

export function StaggerItem({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  effect?: "up" | "3d";
  idle?: RevealIdle;
  phase?: number;
  style?: CSSProperties;
}) {
  return (
    <div className={`jt-stagger-item ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
