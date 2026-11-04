import { z } from "zod";

export const personalizationSchema = z.object({
  playerName: z
    .string()
    .trim()
    .max(12)
    .regex(/^[A-Za-z\s.'-]*$/, "Invalid characters in player name")
    .optional()
    .or(z.literal("")),
  jerseyNumber: z
    .string()
    .trim()
    .regex(/^$|^\d{1,2}$/, "Jersey number must be 1–2 digits")
    .optional()
    .or(z.literal("")),
  customText: z
    .string()
    .trim()
    .max(16)
    .regex(/^[A-Za-z0-9\s.'-]*$/, "Invalid characters in custom text")
    .optional()
    .or(z.literal("")),
});

export type Personalization = z.infer<typeof personalizationSchema>;

export const personalizationSettingsSchema = z.object({
  enabled: z.boolean().default(false),
  maxNameLength: z.number().int().min(1).max(20).default(12),
  maxNumberLength: z.number().int().min(1).max(3).default(2),
  maxCustomTextLength: z.number().int().min(0).max(24).default(16),
  fee: z.string().default("25.00"),
  currency: z.string().default("AED"),
});

export type PersonalizationSettings = z.infer<
  typeof personalizationSettingsSchema
>;
