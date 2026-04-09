import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { postReview } from "./review.controller";
import { createReviewSchema } from "./review.validation";

export const reviewRouter = Router();

reviewRouter.post(
  "/",
  requireAuth,
  requireRole(Role.CUSTOMER),
  validateBody(createReviewSchema),
  asyncRoute(postReview)
);
