"use client";

import { useEffect } from "react";

/** Focus the shop search input when landing with #search */
export function ShopSearchFocus() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#search") return;
    const input = document.getElementById("q") as HTMLInputElement | null;
    input?.focus();
  }, []);
  return null;
}
