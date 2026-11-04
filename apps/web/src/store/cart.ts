"use client";

import { create } from "zustand";

export type CartLine = {
  key: string;
  id: number;
  name: string;
  quantity: number;
  priceLabel: string;
  image?: string;
  variation?: Array<{ name: string; value: string }>;
  personalization?: {
    playerName?: string;
    jerseyNumber?: string;
    customText?: string;
  };
};

type CartState = {
  open: boolean;
  items: CartLine[];
  totalLabel: string;
  count: number;
  loading: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  hydrate: (payload: {
    items: CartLine[];
    totalLabel: string;
    count: number;
  }) => void;
  setLoading: (loading: boolean) => void;
};

export const useCartStore = create<CartState>((set) => ({
  open: false,
  items: [],
  totalLabel: "AED 0.00",
  count: 0,
  loading: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((s) => ({ open: !s.open })),
  hydrate: (payload) => set(payload),
  setLoading: (loading) => set({ loading }),
}));
