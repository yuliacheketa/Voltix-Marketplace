import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { HttpError } from "./errorHandler";

export function requireRole(...roles: Role[]) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.authUser) {
        return next(new HttpError(401, "Потрібна авторизація"));
      }
      const user = await prisma.user.findUnique({
        where: { id: req.authUser.id },
        select: { role: true },
      });
      if (!user || !roles.includes(user.role)) {
        return next(new HttpError(403, "Доступ заборонено"));
      }
      next();
    } catch (e) {
      next(e);
    }
  };
}
