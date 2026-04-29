import type { NextFunction, Request, RequestHandler, Response } from "express";
import { Role } from "@prisma/client";

export function requireRole(
  first: Role | Role[],
  ...rest: Role[]
): RequestHandler {
  const allowed = (
    Array.isArray(first) ? [...first, ...rest] : [first, ...rest]
  ) as Role[];
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
