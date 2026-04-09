import { Router } from "express";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import * as notificationController from "./notification.controller";

export const notificationRouter = Router();

notificationRouter.use(requireAuth);

notificationRouter.get(
  "/",
  asyncRoute(notificationController.getNotifications)
);
notificationRouter.patch(
  "/read-all",
  asyncRoute(notificationController.patchReadAll)
);
notificationRouter.patch(
  "/:notificationId/read",
  asyncRoute(notificationController.patchRead)
);
