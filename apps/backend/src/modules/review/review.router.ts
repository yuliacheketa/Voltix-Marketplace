import { Router } from "express";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { postReview } from "./review.controller";
import { createReviewSchema } from "./review.validation";

export const reviewRouter = Router();

reviewRouter.post(
  "/",
  requireAuth,
  validateBody(createReviewSchema),
  asyncRoute(postReview)
);
