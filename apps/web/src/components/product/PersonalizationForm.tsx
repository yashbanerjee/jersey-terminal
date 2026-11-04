"use client";

import { AnimatePresence, motion } from "framer-motion";
import { PenLine } from "lucide-react";
import { useMemo, useState } from "react";
import { formatAED } from "@/lib/format";

export type PersonalizationValue = {
  player_name: string;
  jersey_number: string;
  custom_text: string;
};

export const EMPTY_PERSONALIZATION: PersonalizationValue = {
  player_name: "",
  jersey_number: "",
  custom_text: "",
};

export function hasPersonalization(v: PersonalizationValue): boolean {
  return Boolean(v.player_name.trim() || v.jersey_number.trim() || v.custom_text.trim());
}

const NAME_RE = /^[\p{L}\s.'\-]*$/u;

export function PersonalizationForm({
  fee,
  maxNameLength,
  value,
  onChange,
}: {
  fee: string;
  maxNameLength: number;
  value: PersonalizationValue;
  onChange: (value: PersonalizationValue) => void;
}) {
  const [touched, setTouched] = useState(false);
  const active = hasPersonalization(value);
  const feeNum = Number(fee) || 0;

  const preview = useMemo(
    () => ({
      name: value.player_name.trim().toUpperCase() || "YOUR NAME",
      num: value.jersey_number.trim() || "10",
    }),
    [value],
  );

  const nameError =
    touched && value.player_name && !NAME_RE.test(value.player_name)
      ? "Letters, spaces, hyphens and apostrophes only."
      : null;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
      <div className="flex items-start justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-jt-neon/10 text-jt-neon">
            <PenLine className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">Name &amp; number</h3>
            <p className="mt-0.5 text-xs text-jt-muted">
              Tell us what to print on the back. Leave blank for a plain jersey.
            </p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-jt-neon/40 px-2.5 py-1 text-[11px] font-medium text-jt-neon">
          {feeNum > 0 ? `+${formatAED(fee)}` : "Free"}
        </span>
      </div>

      <div className="grid gap-5 p-4 sm:grid-cols-[150px_1fr] sm:p-5">
        {/* Jersey back preview */}
        <div className="mx-auto w-full max-w-[150px]">
          <div className="jt-glow-border relative aspect-[4/5] overflow-hidden rounded-xl bg-jt-black ring-1 ring-white/10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_30%,rgba(139,92,246,0.25),transparent_60%),radial-gradient(ellipse_at_50%_100%,rgba(164,255,20,0.15),transparent_55%)]" />
            <div className="absolute inset-x-5 top-4 h-4 rounded-b-full border-b-2 border-white/15" />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-2">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={preview.name}
                  initial={{ y: 8, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -8, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className={`max-w-full truncate jt-display text-base tracking-[0.18em] ${
                    value.player_name ? "jt-gradient-text" : "text-white/35"
                  }`}
                >
                  {preview.name}
                </motion.span>
              </AnimatePresence>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={preview.num}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 1.1, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`jt-display text-6xl leading-none ${
                    value.jersey_number ? "text-white" : "text-white/35"
                  }`}
                >
                  {preview.num}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.2em] text-jt-muted">Back preview</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <label className="block">
            <span className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-jt-muted">
              Name on back
              <span className="normal-case tracking-normal">
                {value.player_name.length}/{maxNameLength}
              </span>
            </span>
            <input
              maxLength={maxNameLength}
              value={value.player_name}
              placeholder="e.g. AHMED"
              autoComplete="off"
              onBlur={() => setTouched(true)}
              onChange={(e) => onChange({ ...value, player_name: e.target.value.toUpperCase() })}
              className={`mt-1.5 w-full rounded-lg border bg-jt-black px-3 py-2.5 text-sm uppercase tracking-[0.12em] text-white outline-none transition-colors focus:border-jt-neon ${
                nameError ? "border-red-400/70" : "border-white/15"
              }`}
            />
            {nameError && <span className="mt-1 block text-xs text-red-400">{nameError}</span>}
          </label>

          <label className="block">
            <span className="text-xs uppercase tracking-[0.16em] text-jt-muted">Number (0–99)</span>
            <input
              maxLength={2}
              inputMode="numeric"
              pattern="[0-9]*"
              value={value.jersey_number}
              placeholder="e.g. 10"
              autoComplete="off"
              onChange={(e) =>
                onChange({ ...value, jersey_number: e.target.value.replace(/\D/g, "").slice(0, 2) })
              }
              className="mt-1.5 w-full rounded-lg border border-white/15 bg-jt-black px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-jt-neon sm:max-w-[160px]"
            />
          </label>

          <AnimatePresence initial={false}>
            {active && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="text-xs text-jt-neon"
              >
                We&apos;ll print{" "}
                <span className="font-semibold text-white">
                  {[value.player_name.trim(), value.jersey_number.trim() && `#${value.jersey_number.trim()}`]
                    .filter(Boolean)
                    .join(" ")}
                </span>{" "}
                exactly as shown. Please double-check the spelling.
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
