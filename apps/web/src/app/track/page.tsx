"use client";

import { FormEvent, useState } from "react";

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
      <h1 className="jt-display text-5xl tracking-wide">
        Track order
      </h1>
      <p className="mt-2 text-sm text-jt-muted">
        Live courier statuses only — we never invent tracking updates.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-3">
        <input
          name="order"
          required
          placeholder="Order number"
          className="w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none focus:border-jt-neon"
        />
        <input
          name="email"
          type="email"
          placeholder="Order email (optional)"
          className="w-full border border-white/15 bg-jt-dark px-4 py-3 text-sm outline-none focus:border-jt-neon"
        />
        <button
          type="submit"
          className="jt-gradient-bg px-6 py-3 text-sm font-semibold uppercase tracking-wider text-jt-black"
        >
          Track
        </button>
      </form>
      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
      {data && (
        <div className="mt-8 space-y-3 border border-white/10 bg-jt-dark p-6 text-sm">
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
        </div>
      )}
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
