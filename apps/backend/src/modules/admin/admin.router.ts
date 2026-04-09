import { Router } from "express";
import { Role } from "@prisma/client";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { requireRole } from "../../middleware/requireRole";
import * as adminController from "./admin.controller";

export const adminRouter = Router();

adminRouter.use(requireAuth);
adminRouter.use(requireRole(Role.ADMIN, Role.MODERATOR));

adminRouter.get("/stats", asyncRoute(adminController.getStats));

adminRouter.get("/users", asyncRoute(adminController.getUsers));
adminRouter.patch(
  "/users/:userId",
  requireRole(Role.ADMIN),
  asyncRoute(adminController.patchUser)
);

adminRouter.get("/sellers", asyncRoute(adminController.getSellers));
adminRouter.patch(
  "/sellers/:sellerId",
  asyncRoute(adminController.patchSeller)
);

adminRouter.get("/products", asyncRoute(adminController.getAdminProducts));
adminRouter.patch(
  "/products/:productId",
  asyncRoute(adminController.patchAdminProductById)
);
adminRouter.delete(
  "/products/:productId",
  requireRole(Role.ADMIN),
  asyncRoute(adminController.deleteAdminProductById)
);

adminRouter.get("/orders", asyncRoute(adminController.getAdminOrders));
adminRouter.patch(
  "/orders/:orderId/status",
  requireRole(Role.ADMIN),
  asyncRoute(adminController.patchAdminOrderStatusById)
);
