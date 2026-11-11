"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ImagePlus,
  Loader2,
  Package,
  Plane,
  Plus,
  Shirt,
  Trash2,
  Users,
} from "lucide-react";
import {
  CUSTOM_MOQ,
  CUSTOM_TIERS,
  FREIGHT_ZONES,
  PLAYER_SIZES,
  SPONSOR_PLACEMENTS,
  formatUSD,
  freightTotalUsd,
  jerseySubtotalUsd,
  orderTotalUsd,
  type CustomTierId,
  type FreightZoneId,
  type PlayerKitRow,
  type SponsorPlacement,
  type SponsorRow,
} from "@/lib/custom-order";
import { cn } from "@/lib/format";

const TIER_ORDER: CustomTierId[] = ["basic", "premium", "luxury"];
const ZONE_ORDER: FreightZoneId[] = ["uae", "gcc", "intl"];
const STEPS = ["Package", "Team & logo", "Players", "Sponsors", "Pay"] as const;

const ACCENT: Record<CustomTierId, string> = {
  basic: "from-jt-cyan/80 via-white/20 to-jt-neon/70",
  premium: "from-jt-neon/90 via-white/25 to-jt-orange/80",
  luxury: "from-jt-orange/95 via-jt-amber/70 to-jt-neon/70",
};

function emptyPlayers(count: number, prev: PlayerKitRow[] = []): PlayerKitRow[] {
  return Array.from({ length: count }, (_, i) => prev[i] ?? { name: "", number: String(i + 1), size: "L" });
}

async function fileToDataUrl(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Logo must be an image file (PNG, JPG, SVG, WebP).");
  if (file.size > 1.8 * 1024 * 1024) throw new Error("Logo must be under 1.8MB.");
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read logo file"));
    reader.readAsDataURL(file);
  });
}

export function CustomOrderBuilder() {
  const [step, setStep] = useState(0);
  const [tier, setTier] = useState<CustomTierId>("premium");
  const [zone, setZone] = useState<FreightZoneId>("uae");
  const [qty, setQty] = useState(CUSTOM_MOQ);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamName, setTeamName] = useState("");
  const [primaryColor, setPrimaryColor] = useState("");
  const [secondaryColor, setSecondaryColor] = useState("");
  const [notes, setNotes] = useState("");
  const [logoDataUrl, setLogoDataUrl] = useState("");
  const [logoName, setLogoName] = useState("");
  const [players, setPlayers] = useState<PlayerKitRow[]>(() => emptyPlayers(CUSTOM_MOQ));
  const [sponsors, setSponsors] = useState<SponsorRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const qtySafe = Math.max(CUSTOM_MOQ, Number.isFinite(qty) ? Math.floor(qty) : CUSTOM_MOQ);
  const active = CUSTOM_TIERS[tier];
  const jerseyTotal = useMemo(() => jerseySubtotalUsd(tier, qtySafe), [tier, qtySafe]);
  const freightTotal = useMemo(() => freightTotalUsd(zone, qtySafe), [zone, qtySafe]);
  const grandTotal = useMemo(() => orderTotalUsd(tier, zone, qtySafe), [tier, zone, qtySafe]);

  useEffect(() => {
    setPlayers((prev) => emptyPlayers(qtySafe, prev));
  }, [qtySafe]);

  function updatePlayer(i: number, patch: Partial<PlayerKitRow>) {
    setPlayers((rows) => rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }

  function addSponsor() {
    setSponsors((rows) => [
      ...rows,
      { name: "", placement: "chest_center" as SponsorPlacement, notes: "" },
    ]);
  }

  function validateStep(current: number) {
    if (current === 0 && qtySafe < CUSTOM_MOQ) {
      return `Minimum order is ${CUSTOM_MOQ} jerseys.`;
    }
    if (current === 1) {
      if (!teamName.trim()) return "Enter the team / club name.";
      if (!name.trim() || !email.trim() || !phone.trim()) return "Contact name, email and phone are required.";
      if (!logoDataUrl) return "Upload your team logo so we can place it on the kit.";
    }
    if (current === 2) {
      for (let i = 0; i < players.length; i++) {
        const p = players[i];
        if (!p.name.trim() || !p.number.trim() || !p.size) {
          return `Complete player row #${i + 1} (name, number, size).`;
        }
      }
    }
    if (current === 3) {
      for (let i = 0; i < sponsors.length; i++) {
        if (!sponsors[i].name.trim()) return `Sponsor #${i + 1} needs a name (or remove the row).`;
      }
    }
    return null;
  }

  function next() {
    const msg = validateStep(step);
    if (msg) {
      setError(msg);
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  function back() {
    setError(null);
    setStep((s) => Math.max(0, s - 1));
  }

  async function onLogo(file: File | null) {
    if (!file) return;
    try {
      setError(null);
      const dataUrl = await fileToDataUrl(file);
      setLogoDataUrl(dataUrl);
      setLogoName(file.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Logo upload failed");
    }
  }

  async function onPay() {
    const msg = validateStep(3) || validateStep(1) || validateStep(2);
    if (msg) {
      setError(msg);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/custom-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          zone,
          quantity: qtySafe,
          name,
          email,
          phone,
          teamName,
          primaryColor,
          secondaryColor,
          notes,
          logoDataUrl,
          players,
          sponsors,
        }),
      });
      const data = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout");
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed");
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={cn(
              "inline-flex items-center gap-2 border px-3 py-1.5 text-[10px] uppercase tracking-[0.18em]",
              i === step
                ? "border-jt-neon/60 bg-jt-neon/15 text-jt-neon"
                : i < step
                  ? "border-white/20 text-white/70"
                  : "border-white/10 text-white/35",
            )}
          >
            <span className="jt-display text-xs">{String(i + 1).padStart(2, "0")}</span>
            {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-4">
            {TIER_ORDER.map((id) => {
              const t = CUSTOM_TIERS[id];
              const selected = tier === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTier(id)}
                  className={cn(
                    "jt-chamfer w-full bg-gradient-to-br p-px text-left transition",
                    ACCENT[id],
                    selected ? "shadow-[0_0_40px_-12px_rgba(180,255,26,0.55)]" : "opacity-85 hover:opacity-100",
                  )}
                >
                  <div className="jt-chamfer bg-jt-dark p-4 sm:p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-neon">
                          {t.name} kit
                        </p>
                        <h3 className="mt-1 jt-display text-2xl text-white sm:text-3xl">{t.name}</h3>
                        <p className="mt-2 max-w-xl text-sm text-white/65">{t.tagline}</p>
                      </div>
                      <div className="jt-slant bg-black/50 px-3 py-2 ring-1 ring-white/10">
                        <p className="text-[9px] uppercase tracking-[0.2em] text-jt-muted">Per jersey</p>
                        <p className="jt-display text-xl">
                          <span className="jt-gradient-text-fire">{formatUSD(t.priceUsd)}</span>
                        </p>
                      </div>
                    </div>
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {t.highlights.map((h) => (
                        <li key={h} className="flex items-start gap-2 text-sm text-white/70">
                          <Check className={cn("mt-0.5 h-4 w-4 shrink-0", selected ? "text-jt-neon" : "text-white/35")} />
                          <span>{h}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="jt-chamfer h-fit border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-jt-orange">For team owners</p>
            <h3 className="mt-2 jt-display text-2xl text-white">How custom kits work</h3>
            <ol className="mt-4 space-y-3 text-sm text-white/70">
              <li>1. Pick Basic, Premium, or Luxury.</li>
              <li>2. Upload your club logo and team name.</li>
              <li>3. Enter each player’s name & number for every shirt.</li>
              <li>4. Add sponsors and where each logo should sit.</li>
              <li>5. Pay jersey total + freight. We design & print.</li>
            </ol>
            <label className="mt-5 block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
              Number of jerseys
              <input
                type="number"
                min={CUSTOM_MOQ}
                max={120}
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm text-white outline-none focus:border-jt-neon"
              />
            </label>
            <p className="mt-2 text-xs text-white/45">Minimum {CUSTOM_MOQ}. Selected: {active.name}.</p>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="jt-chamfer border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
          <h3 className="jt-display text-2xl text-white">Team identity</h3>
          <p className="mt-2 text-sm text-white/60">
            Local club owners: give us the official team name and crest. We’ll place it on the kit.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted sm:col-span-2">
              Team / club name
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
                required
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
              Primary colour
              <input
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="e.g. Purple"
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
              Secondary colour
              <input
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="e.g. Gold"
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              />
            </label>
            <div className="sm:col-span-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-jt-muted">Team logo</p>
              <label className="mt-2 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-black/30 px-4 py-8 text-center transition hover:border-jt-neon/50">
                {logoDataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoDataUrl} alt="Team logo preview" className="h-24 w-24 object-contain" />
                ) : (
                  <ImagePlus className="h-8 w-8 text-jt-neon" />
                )}
                <span className="text-sm text-white/70">
                  {logoName || "Upload PNG / JPG / SVG (max 1.8MB)"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => void onLogo(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
              Contact name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
                required
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted">
              Email
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
                required
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted sm:col-span-2">
              Phone / WhatsApp
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
                required
              />
            </label>
            <label className="block text-[11px] uppercase tracking-[0.18em] text-jt-muted sm:col-span-2">
              Extra design notes
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Collar style, font preference, match vs training cut…"
                className="mt-2 w-full border border-white/15 bg-jt-black px-4 py-3 text-sm outline-none focus:border-jt-neon"
              />
            </label>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="jt-chamfer border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h3 className="jt-display text-2xl text-white">Player names & numbers</h3>
              <p className="mt-2 text-sm text-white/60">
                One row per jersey ({qtySafe}). We’ll print each name and number on the back.
              </p>
            </div>
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-jt-cyan">
              <Users className="h-4 w-4" /> {players.length} shirts
            </p>
          </div>
          <div className="mt-5 max-h-[28rem] space-y-2 overflow-y-auto pr-1">
            {players.map((p, i) => (
              <div key={i} className="grid grid-cols-[2.5rem_1fr_5rem_6.5rem] items-center gap-2 sm:grid-cols-[3rem_1fr_5.5rem_7rem]">
                <span className="text-center text-xs text-white/40">#{i + 1}</span>
                <input
                  value={p.name}
                  onChange={(e) => updatePlayer(i, { name: e.target.value.toUpperCase() })}
                  placeholder="PLAYER NAME"
                  className="border border-white/15 bg-jt-black px-3 py-2.5 text-sm outline-none focus:border-jt-neon"
                  required
                />
                <input
                  value={p.number}
                  onChange={(e) => updatePlayer(i, { number: e.target.value.replace(/[^\d]/g, "").slice(0, 3) })}
                  placeholder="No."
                  className="border border-white/15 bg-jt-black px-3 py-2.5 text-sm outline-none focus:border-jt-neon"
                  required
                />
                <select
                  value={p.size}
                  onChange={(e) => updatePlayer(i, { size: e.target.value })}
                  className="border border-white/15 bg-jt-black px-2 py-2.5 text-sm outline-none focus:border-jt-neon"
                >
                  {PLAYER_SIZES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="jt-chamfer border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
          <h3 className="jt-display text-2xl text-white">Sponsors & placement</h3>
          <p className="mt-2 text-sm text-white/60">
            Optional. Add each sponsor and where their mark should sit on the jersey.
          </p>
          <div className="mt-5 space-y-3">
            {sponsors.length === 0 && (
              <p className="border border-white/10 bg-white/[0.02] px-4 py-6 text-center text-sm text-white/45">
                No sponsors yet — skip this step if the kit is crest-only.
              </p>
            )}
            {sponsors.map((s, i) => (
              <div key={i} className="grid gap-2 border border-white/10 bg-black/25 p-3 sm:grid-cols-[1fr_1fr_auto]">
                <input
                  value={s.name}
                  onChange={(e) =>
                    setSponsors((rows) => rows.map((row, idx) => (idx === i ? { ...row, name: e.target.value } : row)))
                  }
                  placeholder="Sponsor name"
                  className="border border-white/15 bg-jt-black px-3 py-2.5 text-sm outline-none focus:border-jt-neon"
                />
                <select
                  value={s.placement}
                  onChange={(e) =>
                    setSponsors((rows) =>
                      rows.map((row, idx) =>
                        idx === i ? { ...row, placement: e.target.value as SponsorPlacement } : row,
                      ),
                    )
                  }
                  className="border border-white/15 bg-jt-black px-3 py-2.5 text-sm outline-none focus:border-jt-neon"
                >
                  {(Object.keys(SPONSOR_PLACEMENTS) as SponsorPlacement[]).map((key) => (
                    <option key={key} value={key}>
                      {SPONSOR_PLACEMENTS[key]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setSponsors((rows) => rows.filter((_, idx) => idx !== i))}
                  className="inline-flex items-center justify-center gap-1 border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.14em] text-white/60 hover:border-jt-coral/50 hover:text-jt-coral"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Remove
                </button>
                <input
                  value={s.notes || ""}
                  onChange={(e) =>
                    setSponsors((rows) =>
                      rows.map((row, idx) => (idx === i ? { ...row, notes: e.target.value } : row)),
                    )
                  }
                  placeholder="Placement notes (size, colour, exclusivity…)"
                  className="border border-white/15 bg-jt-black px-3 py-2.5 text-sm outline-none focus:border-jt-neon sm:col-span-3"
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addSponsor}
            disabled={sponsors.length >= 8}
            className="mt-4 inline-flex items-center gap-2 border border-jt-neon/40 bg-jt-neon/10 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-jt-neon disabled:opacity-40"
          >
            <Plus className="h-4 w-4" /> Add sponsor
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="jt-chamfer border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
            <h3 className="jt-display text-2xl text-white">Order summary</h3>
            <dl className="mt-4 space-y-2 text-sm text-white/70">
              <div className="flex justify-between gap-3"><dt>Team</dt><dd className="text-white">{teamName}</dd></div>
              <div className="flex justify-between gap-3"><dt>Package</dt><dd className="text-white">{active.name}</dd></div>
              <div className="flex justify-between gap-3"><dt>Jerseys</dt><dd className="text-white">{qtySafe}</dd></div>
              <div className="flex justify-between gap-3"><dt>Players listed</dt><dd className="text-white">{players.length}</dd></div>
              <div className="flex justify-between gap-3"><dt>Sponsors</dt><dd className="text-white">{sponsors.length || "None"}</dd></div>
              <div className="flex justify-between gap-3"><dt>Logo</dt><dd className="text-white">{logoName || "Uploaded"}</dd></div>
            </dl>
            <div className="mt-5 max-h-40 overflow-y-auto border border-white/10 bg-black/30 p-3 text-xs text-white/55">
              {players.slice(0, 20).map((p, i) => (
                <p key={i}>
                  #{p.number || "—"} {p.name || "—"} · {p.size}
                </p>
              ))}
              {players.length > 20 && <p>…and {players.length - 20} more</p>}
            </div>
          </div>

          <div className="jt-chamfer border border-white/10 bg-jt-dark/90 p-5 sm:p-6">
            <p className="text-[11px] uppercase tracking-[0.18em] text-jt-muted">Freight zone</p>
            <div className="mt-2 grid gap-2">
              {ZONE_ORDER.map((id) => {
                const z = FREIGHT_ZONES[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setZone(id)}
                    className={cn(
                      "flex items-start justify-between gap-3 border px-3 py-3 text-left transition",
                      zone === id ? "border-jt-neon/60 bg-jt-neon/10" : "border-white/10 bg-white/[0.02]",
                    )}
                  >
                    <span>
                      <span className="block text-sm font-medium text-white">{z.label}</span>
                      <span className="mt-0.5 block text-xs text-white/50">{z.note}</span>
                    </span>
                    <span className="text-xs text-jt-amber">{formatUSD(z.perJerseyUsd)}/jersey</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 border-t border-white/10 pt-5 text-sm">
              <div className="flex justify-between gap-3 text-white/70">
                <span className="inline-flex items-center gap-2"><Shirt className="h-4 w-4 text-jt-neon" />{active.name} × {qtySafe}</span>
                <span>{formatUSD(jerseyTotal)}</span>
              </div>
              <div className="flex justify-between gap-3 text-white/70">
                <span className="inline-flex items-center gap-2"><Plane className="h-4 w-4 text-jt-orange" />Freight</span>
                <span>{formatUSD(freightTotal)}</span>
              </div>
              <div className="flex justify-between gap-3 border-t border-white/10 pt-3 jt-display text-lg">
                <span className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.16em] text-jt-muted">
                  <Package className="h-4 w-4" /> Total due
                </span>
                <span className="jt-gradient-text-aurora">{formatUSD(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-sm text-jt-coral">{error}</p>}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={back}
          disabled={step === 0 || busy}
          className="inline-flex items-center gap-2 border border-white/15 px-4 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/70 disabled:opacity-30"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="jt-gradient-bg inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-jt-black"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void onPay()}
            disabled={busy}
            className="jt-gradient-bg inline-flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.18em] text-jt-black disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Preparing Stripe…
              </>
            ) : (
              <>
                Pay jersey + freight <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
