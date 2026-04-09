import { z } from "zod";

export const addCartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(99),
});

export const patchCartItemSchema = z.object({
  quantity: z.number().int().min(1).max(99),
});

export type AddCartItemBody = z.infer<typeof addCartItemSchema>;
export type PatchCartItemBody = z.infer<typeof patchCartItemSchema>;
