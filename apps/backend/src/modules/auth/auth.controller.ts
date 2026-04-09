import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import {
  getUserProfile,
  loginUser,
  refreshAccessToken,
  registerUser,
  verifyEmailByToken,
} from "./auth.service";
import type {
  LoginInput,
  RefreshTokenBody,
  RegisterInput,
} from "./auth.validation";
import { verifyEmailQuerySchema } from "./auth.validation";

export async function register(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const body = req.body as RegisterInput;
  try {
    const result = await registerUser(body);
    return res.status(201).json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "FORBIDDEN_ROLE") {
      return res.status(403).json({
        success: false,
        errors: [
          { message: "Цю роль не можна зареєструвати через публічну форму" },
        ],
      });
    }
    if (e instanceof Error && e.message === "JWT_SECRET is not set") {
      throw new HttpError(500, "Помилка конфігурації сервера");
    }
    throw e;
  }
}

export async function login(req: Request, res: Response, _next: NextFunction) {
  const body = req.body as LoginInput;
  try {
    const result = await loginUser(body);
    return res.json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "JWT_SECRET is not set") {
      throw new HttpError(500, "Помилка конфігурації сервера");
    }
    throw e;
  }
}

export async function me(req: Request, res: Response, _next: NextFunction) {
  const auth = req.authUser;
  if (!auth) {
    throw new HttpError(401, "Потрібна авторизація");
  }
  const user = await getUserProfile(auth.id);
  return res.json({ user });
}

export async function verifyEmail(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const parsed = verifyEmailQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: "Некоректний або відсутній токен" });
  }
  const result = await verifyEmailByToken(parsed.data.token);
  return res.json(result);
}

export async function refreshToken(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const body = req.body as RefreshTokenBody;
  try {
    const { token } = refreshAccessToken(body.token);
    return res.json({ token });
  } catch (e) {
    if (e instanceof Error && e.message === "JWT_SECRET is not set") {
      throw new HttpError(500, "Помилка конфігурації сервера");
    }
    throw e;
  }
}
