import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";

export function requireRole(...allowed: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const role = req.user?.role;
    if (!role || !allowed.includes(role)) {
      return res.status(403).json({
        success: false,
        errors: [{ message: "Forbidden" }],
      });
    }
    next();
  };
}
