import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import { createOrder, listSellerOrders } from "./order.controller";
import { createOrderSchema } from "./order.validation";

export const orderRouter = Router();

orderRouter.post(
  "/",
  requireAuth,
  validateBody(createOrderSchema),
  asyncRoute(createOrder)
);

orderRouter.get(
  "/seller",
  requireAuth,
  requireRole(Role.SELLER),
  asyncRoute(listSellerOrders)
);
