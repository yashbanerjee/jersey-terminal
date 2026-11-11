"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import {
  EMPTY_CONTACT,
  WHATSAPP_DEFAULT_MESSAGE,
  whatsappUrl,
  type StorefrontContact,
} from "@/lib/site";

const ContactContext = createContext<StorefrontContact>(EMPTY_CONTACT);

export function ContactProvider({
  contact,
  children,
}: {
  contact: StorefrontContact;
  children: ReactNode;
}) {
  const value = useMemo(() => contact, [contact]);
  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
}

export function useStorefrontContact() {
  return useContext(ContactContext);
}

export function useWhatsAppHref(message = WHATSAPP_DEFAULT_MESSAGE) {
  const contact = useStorefrontContact();
  if (!contact.whatsappEnabled) return null;
  return whatsappUrl(contact.whatsappNumber, message);
}
