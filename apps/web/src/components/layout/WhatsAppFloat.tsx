"use client";

import { MessageCircle } from "lucide-react";
import { useWhatsAppHref } from "@/components/layout/ContactProvider";

export function WhatsAppFloat() {
  const href = useWhatsAppHref();
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-5 right-5 z-[55] inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_40px_-12px_rgba(37,211,102,0.9)] transition hover:scale-[1.03] hover:brightness-110 sm:bottom-6 sm:right-6"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}
