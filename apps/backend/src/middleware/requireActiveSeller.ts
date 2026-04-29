import type { NextFunction, Request, Response } from "express";
import { SellerStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export function requireActiveSeller(
  req: Request,
  res: Response,
  next: NextFunction
) {
  void (async () => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({
          success: false,
          errors: [{ message: "Unauthorized" }],
        });
        return;
      }
      const profile = await prisma.sellerProfile.findUnique({
        where: { userId },
        select: { status: true },
      });
      if (!profile || profile.status !== SellerStatus.ACTIVE) {
        res.status(403).json({
          success: false,
          errors: [{ message: "Seller account is not active" }],
        });
        return;
      }
      next();
    } catch (e) {
      next(e);
    }
  })();
}
