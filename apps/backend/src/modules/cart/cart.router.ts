import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import * as cartController from "./cart.controller";
import { addCartItemSchema, patchCartItemSchema } from "./cart.validation";

export const cartRouter = Router();

cartRouter.use(requireAuth);
cartRouter.use(requireRole(Role.CUSTOMER));

cartRouter.get("/", asyncRoute(cartController.getCart));
cartRouter.get(
  "/checkout-summary",
  asyncRoute(cartController.getCheckoutSummary)
);
cartRouter.post(
  "/items",
  validateBody(addCartItemSchema),
  asyncRoute(cartController.postItem)
);
cartRouter.patch(
  "/items/:cartItemId",
  validateBody(patchCartItemSchema),
  asyncRoute(cartController.patchItem)
);
cartRouter.delete("/items/:cartItemId", asyncRoute(cartController.deleteItem));
cartRouter.delete("/", asyncRoute(cartController.deleteCart));
