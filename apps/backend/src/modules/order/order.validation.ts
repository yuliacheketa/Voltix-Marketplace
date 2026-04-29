import { PaymentMethod } from "@prisma/client";
import { z } from "zod";

export const placeOrderFromCartSchema = z.object({
  addressId: z.string().uuid(),
  deliveryMethod: z.enum(["STANDARD", "EXPRESS", "PICKUP"]),
  deliveryCost: z.coerce.number().min(0),
  note: z.string().max(2000).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

export type PlaceOrderFromCartBody = z.infer<typeof placeOrderFromCartSchema>;
