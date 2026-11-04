import { z } from "zod";

export const ShippingZone = {
  UAE: 1,
  GCC: 2,
  UK_EUROPE: 3,
  USA_CANADA: 4,
  ASIA_PACIFIC: 5,
  REST_OF_WORLD: 6,
} as const;

export type ShippingZoneId = (typeof ShippingZone)[keyof typeof ShippingZone];

export const CourierProvider = {
  ARAMEX: "aramex",
  DHL: "dhl",
} as const;

export type CourierProviderId =
  (typeof CourierProvider)[keyof typeof CourierProvider];

export const ShipmentStatus = {
  PENDING: "pending",
  CREATED: "created",
  LABEL_GENERATED: "label_generated",
  PICKED_UP: "picked_up",
  IN_TRANSIT: "in_transit",
  OUT_FOR_DELIVERY: "out_for_delivery",
  DELIVERED: "delivered",
  FAILED: "failed",
  RETURNED: "returned",
  CANCELLED: "cancelled",
} as const;

export type ShipmentStatusId =
  (typeof ShipmentStatus)[keyof typeof ShipmentStatus];

export const CustomsArrangement = {
  DAP: "DAP",
  DDP: "DDP",
} as const;

export const trackingQuerySchema = z.object({
  orderNumber: z.string().min(1),
  email: z.string().email().optional(),
});

export const shipmentMetaSchema = z.object({
  courier: z.enum(["aramex", "dhl"]),
  awb: z.string().min(1),
  status: z.string(),
  trackingUrl: z.string().url().optional(),
  estimatedDelivery: z.string().optional(),
  lastUpdate: z.string().optional(),
  labelUrl: z.string().url().optional(),
});

export type ShipmentMeta = z.infer<typeof shipmentMetaSchema>;

export const UAE_EMIRATES = [
  "Abu Dhabi",
  "Dubai",
  "Sharjah",
  "Ajman",
  "Umm Al Quwain",
  "Ras Al Khaimah",
  "Fujairah",
] as const;
