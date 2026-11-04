/** Client-only helpers for throttling motion on phones / low-power devices. */

export function isMobilePerfTarget(): boolean {
  if (typeof window === "undefined") return false;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;
  const saveData =
    typeof navigator !== "undefined" &&
    "connection" in navigator &&
    Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
  return coarse || narrow || saveData;
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Race a promise against a timeout so boot never hangs on fonts/network. */
export function withTimeout(promise: Promise<unknown>, ms: number): Promise<void> {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    const t = window.setTimeout(finish, ms);
    promise.then(finish, finish).finally(() => window.clearTimeout(t));
  });
}
