import { Router } from "express";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import * as userController from "./user.controller";
import {
  changePasswordSchema,
  createAddressSchema,
  updateAddressSchema,
  updateProfileSchema,
} from "./user.validation";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get("/me", userController.getMe);
userRouter.patch(
  "/me",
  validateBody(updateProfileSchema),
  userController.patchMe
);
userRouter.patch(
  "/me/password",
  validateBody(changePasswordSchema),
  userController.patchPassword
);
userRouter.get("/me/orders", userController.getMyOrders);
userRouter.post(
  "/me/addresses",
  validateBody(createAddressSchema),
  userController.postAddress
);
userRouter.patch(
  "/me/addresses/:addressId",
  validateBody(updateAddressSchema),
  userController.patchAddress
);
userRouter.delete("/me/addresses/:addressId", userController.deleteAddress);
