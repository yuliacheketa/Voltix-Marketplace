import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { getOrderById, postOrderFromCart } from "./order.controller";
import { placeOrderFromCartSchema } from "./order.validation";

export const orderRouter = Router();

orderRouter.post(
  "/",
  requireAuth,
  requireRole(Role.CUSTOMER),
  validateBody(placeOrderFromCartSchema),
  asyncRoute(postOrderFromCart)
);

orderRouter.get(
  "/:orderId",
  requireAuth,
  requireRole(Role.CUSTOMER),
  asyncRoute(getOrderById)
);
