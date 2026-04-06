import type { NextFunction, Request, Response } from "express";
import { Role } from "@prisma/client";
import jwt from "jsonwebtoken";

function unauthorized(res: Response) {
  return res.status(401).json({
    success: false,
    errors: [{ message: "Unauthorized" }],
  });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return unauthorized(res);
  }
  const token = header.slice(7);
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({
      success: false,
      errors: [{ message: "Server configuration error" }],
    });
  }
  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || payload.sub == null) {
      return unauthorized(res);
    }
    const sub = payload.sub;
    if (typeof sub !== "string") {
      return unauthorized(res);
    }
    const email = (payload as jwt.JwtPayload).email;
    if (typeof email !== "string") {
      return unauthorized(res);
    }
    const roleRaw = (payload as jwt.JwtPayload).role;
    const role =
      typeof roleRaw === "string" &&
      (Object.values(Role) as string[]).includes(roleRaw)
        ? (roleRaw as Role)
        : Role.CUSTOMER;
    req.authUser = { id: sub, email };
    req.user = { userId: sub, email, role };
    next();
  } catch {
    return unauthorized(res);
  }
}
