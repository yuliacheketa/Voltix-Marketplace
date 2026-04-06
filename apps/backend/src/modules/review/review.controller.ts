import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { createReview } from "./review.service";
import type { CreateReviewBody } from "./review.validation";

export async function postReview(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const auth = req.authUser;
  if (!auth) {
    throw new HttpError(401, "Потрібна авторизація");
  }
  const body = req.body as CreateReviewBody;
  const review = await createReview(auth.id, body);
  return res.status(201).json({ review });
}
