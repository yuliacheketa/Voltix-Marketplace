import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { createReview } from "./review.service";
import type { CreateReviewBody } from "./review.validation";

export async function postReview(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const userId = req.user?.userId;
  if (!userId) {
    throw new HttpError(401, "Unauthorized");
  }
  const body = req.body as CreateReviewBody;
  const data = await createReview(userId, body);
  return res.status(201).json({ success: true, data });
}
