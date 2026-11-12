"use client";

import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef, useState, type PointerEvent } from "react";

type Img = { id: number; src: string; alt: string };

/**
 * Product hero image — drag / swipe to rotate in 3D like inspecting a jersey.
 * Lifestyle portraits use contain + taller frame so faces are never cropped.
 */
export function ProductGallery3D({
  images,
  name,
}: {
  images: Img[];
  name: string;
}) {
  const primary = images[0];
  const [active, setActive] = useState(0);
  const current = images[active] ?? primary;

  const root = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(rx, { stiffness: 160, damping: 18, mass: 0.4 });
  const rotateY = useSpring(ry, { stiffness: 160, damping: 18, mass: 0.4 });
  const glareX = useTransform(ry, [-18, 18], [30, 70]);
  const glareY = useTransform(rx, [10, -10], [35, 65]);
  const glareBg = useMotionTemplate`radial-gradient(420px circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.22), transparent 55%)`;

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    dragging.current = true;
    lastX.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!dragging.current) return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    ry.set(Math.max(-22, Math.min(22, ry.get() + dx * 0.28)));
    rx.set(0);
  }
  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    dragging.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
    rx.set(0);
    ry.set(0);
  }
  function onPointerLeave() {
    if (dragging.current) return;
    rx.set(0);
    ry.set(0);
  }

  if (!current) {
    return <div className="jt-chamfer aspect-[2/3] w-full bg-jt-surface" />;
  }

  return (
    <div className="space-y-3">
      <div
        ref={root}
        className="relative touch-none select-none"
        style={{ perspective: "1200px" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            transformPerspective: 1200,
          }}
          className="jt-card jt-glow-border group relative aspect-[2/3] w-full cursor-grab overflow-hidden rounded-2xl bg-[radial-gradient(ellipse_at_50%_70%,#4a0d5c_0%,#1a0824_52%,#050607_100%)] ring-1 ring-white/10 shadow-[0_40px_120px_-40px_rgba(255,122,26,0.4)] active:cursor-grabbing"
        >
          <div className="jt-card-media absolute inset-0 p-1.5 sm:p-2" style={{ transform: "translateZ(12px)" }}>
            <div className="relative h-full w-full">
              <Image
                src={current.src}
                alt={current.alt || name}
                fill
                priority
                quality={95}
                className="!object-contain !object-center"
                sizes="(max-width:1024px) 100vw, 50vw"
                draggable={false}
              />
            </div>
          </div>
          <motion.span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] mix-blend-soft-light opacity-40"
            style={{ background: glareBg }}
          />
          <p className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
            Drag to rotate
          </p>
        </motion.div>
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => {
                setActive(i);
                rx.set(0);
                ry.set(0);
              }}
              className={`relative aspect-[2/3] overflow-hidden rounded-lg bg-[radial-gradient(ellipse_at_50%_70%,#4a0d5c_0%,#1a0824_55%,#050607_100%)] ring-1 transition-transform duration-300 hover:scale-[1.03] ${
                active === i ? "ring-jt-neon shadow-[0_0_20px_-6px_rgba(180,255,26,0.7)]" : "ring-white/10"
              }`}
            >
              <Image
                src={img.src}
                alt={img.alt || name}
                fill
                quality={90}
                className="!object-contain !object-center p-0.5"
                sizes="25vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
