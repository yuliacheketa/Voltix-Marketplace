import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import * as paymentController from "./payment.controller";
import { failPaymentSchema } from "./payment.validation";

export const paymentRouter = Router();

paymentRouter.post(
  "/:paymentId/confirm",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncRoute(paymentController.postConfirm)
);
paymentRouter.post(
  "/:paymentId/fail",
  requireAuth,
  requireRole(Role.CUSTOMER),
  validateBody(failPaymentSchema),
  asyncRoute(paymentController.postFail)
);
paymentRouter.post(
  "/:paymentId/retry",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncRoute(paymentController.postRetry)
);
