"use client";

import { useState } from "react";
import { Ruler, X } from "lucide-react";

const ADULT = [
  { size: "S", chest: "88–94", length: "70" },
  { size: "M", chest: "94–100", length: "72" },
  { size: "L", chest: "100–106", length: "74" },
  { size: "XL", chest: "106–112", length: "76" },
  { size: "XXL", chest: "112–118", length: "78" },
  { size: "3XL", chest: "118–124", length: "80" },
];

const YOUTH = [
  { size: "YS", chest: "66–72", length: "52" },
  { size: "YM", chest: "72–78", length: "56" },
  { size: "YL", chest: "78–84", length: "60" },
];

export function SizeGuide({ compact = false }: { compact?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          compact
            ? "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-jt-cyan hover:text-white"
            : "inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-jt-cyan underline-offset-4 hover:text-white hover:underline"
        }
      >
        <Ruler className="h-3.5 w-3.5" />
        Size guide
      </button>

      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 p-3 sm:items-center sm:p-6">
          <button type="button" className="absolute inset-0" aria-label="Close size guide" onClick={() => setOpen(false)} />
          <div className="relative z-[1] max-h-[85svh] w-full max-w-lg overflow-y-auto border border-white/15 bg-jt-dark p-5 shadow-2xl sm:p-6">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-jt-neon">Fit chart</p>
                <h3 className="mt-1 jt-display text-2xl text-white">Jersey size guide</h3>
                <p className="mt-1 text-xs text-white/55">Measurements in cm. Athletic fit — size up for a looser street look.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/5" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-jt-muted">Adult</p>
            <table className="mb-5 w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-jt-muted">
                  <th className="py-2 pr-2">Size</th>
                  <th className="py-2 pr-2">Chest</th>
                  <th className="py-2">Length</th>
                </tr>
              </thead>
              <tbody>
                {ADULT.map((r) => (
                  <tr key={r.size} className="border-b border-white/5 text-white/80">
                    <td className="py-2 pr-2 font-medium text-white">{r.size}</td>
                    <td className="py-2 pr-2">{r.chest}</td>
                    <td className="py-2">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-jt-muted">Youth</p>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-[11px] uppercase tracking-[0.14em] text-jt-muted">
                  <th className="py-2 pr-2">Size</th>
                  <th className="py-2 pr-2">Chest</th>
                  <th className="py-2">Length</th>
                </tr>
              </thead>
              <tbody>
                {YOUTH.map((r) => (
                  <tr key={r.size} className="border-b border-white/5 text-white/80">
                    <td className="py-2 pr-2 font-medium text-white">{r.size}</td>
                    <td className="py-2 pr-2">{r.chest}</td>
                    <td className="py-2">{r.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
