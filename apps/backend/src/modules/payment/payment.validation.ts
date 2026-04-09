import { z } from "zod";

export const failPaymentSchema = z.object({
  failureReason: z.string().max(200).optional(),
});

export type FailPaymentBody = z.infer<typeof failPaymentSchema>;
