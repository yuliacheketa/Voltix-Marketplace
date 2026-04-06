import { z } from "zod";

export const createReviewSchema = z.object({
  orderItemId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  body: z.string().max(5000).optional(),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>;
