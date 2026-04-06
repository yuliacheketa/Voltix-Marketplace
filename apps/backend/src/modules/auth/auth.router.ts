import { Router } from "express";
import { asyncRoute } from "../../middleware/asyncRoute";
import { requireAuth } from "../../middleware/requireAuth";
import { validateBody } from "../../middleware/validate";
import { login, me, register, verifyEmail } from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validation";

export const authRouter = Router();

authRouter.post(
  "/register",
  validateBody(registerSchema),
  asyncRoute(register)
);

authRouter.post("/login", validateBody(loginSchema), asyncRoute(login));

authRouter.get("/verify-email", asyncRoute(verifyEmail));

authRouter.get("/me", requireAuth, asyncRoute(me));
