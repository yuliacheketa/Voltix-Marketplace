import { z } from "zod";

export const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  deliveryMethod: z.string().min(1).max(120),
  deliveryCost: z.union([z.string().min(1), z.number()]),
  lines: z
    .array(
      z.object({
        variantId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
  note: z.string().max(2000).optional(),
});

export type CreateOrderBody = z.infer<typeof createOrderSchema>;
