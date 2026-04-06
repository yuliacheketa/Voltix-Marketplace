import { Role } from "@prisma/client";
import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import { validateBody } from "../../middleware/validate";
import * as sellerController from "./seller.controller";
import {
  createProductSchema,
  patchSellerOrderStatusSchema,
  updateProductSchema,
  updateSellerSchema,
} from "./seller.validation";

export const sellerRouter = Router();

sellerRouter.use(requireAuth);
sellerRouter.use(requireRole(Role.SELLER));

sellerRouter.get("/me", sellerController.getMe);
sellerRouter.patch(
  "/me",
  validateBody(updateSellerSchema),
  sellerController.patchMe
);
sellerRouter.get("/products", sellerController.getProducts);
sellerRouter.get("/products/:productId", sellerController.getProduct);
sellerRouter.post(
  "/products",
  validateBody(createProductSchema),
  sellerController.postProduct
);
sellerRouter.patch(
  "/products/:productId",
  validateBody(updateProductSchema),
  sellerController.patchProduct
);
sellerRouter.delete("/products/:productId", sellerController.deleteProduct);
sellerRouter.get("/orders", sellerController.getOrders);
sellerRouter.patch(
  "/orders/:sellerOrderId/status",
  validateBody(patchSellerOrderStatusSchema),
  sellerController.patchOrderStatus
);
sellerRouter.get("/stats", sellerController.getStats);
sellerRouter.get("/categories", sellerController.getCategories);
