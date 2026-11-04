"use client";

import { AnimatePresence, motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { SplitHeading } from "@/components/motion/SplitHeading";

type Tracking = {
  orderNumber: string;
  courier: string | null;
  awb: string | null;
  status: string | null;
  estimatedDelivery: string | null;
  trackingUrl: string | null;
  lastUpdate: string | null;
  customsArrangement?: string;
};

export default function TrackPage() {
  const [data, setData] = useState<Tracking | null>(null);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setData(null);
    const fd = new FormData(e.currentTarget);
    const order = String(fd.get("order") || "");
    const email = String(fd.get("email") || "");
    const q = new URLSearchParams({ order });
    if (email) q.set("email", email);
    const res = await fetch(`/api/tracking?${q}`);
    const json = await res.json();
    if (!res.ok) {
      setError(json.error || "Not found");
      return;
    }
    setData(json);
  }

  return (
    <div className="jt-page jt-container w-full max-w-3xl">
      <Reveal effect="blur">
        <p className="mb-2 text-[11px] uppercase tracking-[0.3em] text-jt-neon">Support</p>
      </Reveal>
      <SplitHeading as="h1" text="Track order" className="jt-display text-5xl tracking-wide sm:text-6xl" />
      <Reveal y={12} delay={0.1}>
        <p className="mt-2 text-sm text-jt-muted">Live courier statuses only — we never invent tracking updates.</p>
      </Reveal>

      <Reveal effect="3d" delay={0.15} className="mt-8">
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            name="order"
            required
            placeholder="Order number"
            className="w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none transition focus:border-jt-neon"
          />
          <input
            name="email"
            type="email"
            placeholder="Order email (optional)"
            className="w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none transition focus:border-jt-neon"
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="jt-gradient-bg jt-slant px-6 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
          >
            Track
          </motion.button>
        </form>
      </Reveal>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key="err"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
        {data && (
          <motion.div
            key={data.orderNumber}
            initial={{ opacity: 0, y: 20, rotateX: 8 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformPerspective: 800 }}
            className="mt-8 space-y-3 border border-white/10 bg-jt-dark p-6 text-sm"
          >
            <Row label="Order" value={`#${data.orderNumber}`} />
            <Row label="Courier" value={data.courier?.toUpperCase() || "—"} />
            <Row label="AWB" value={data.awb || "Not shipped yet"} />
            <Row label="Status" value={data.status || "Awaiting shipment"} />
            <Row label="ETA" value={data.estimatedDelivery || "—"} />
            <Row label="Last update" value={data.lastUpdate || "—"} />
            <Row label="Customs" value={data.customsArrangement || "DAP"} />
            {data.trackingUrl && (
              <a
                href={data.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block pt-2 text-jt-neon underline"
              >
                Open courier tracking
              </a>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2">
      <span className="text-jt-muted">{label}</span>
      <span className="text-right text-white">{value}</span>
    </div>
  );
}
