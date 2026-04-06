import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof HttpError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String)
        : target != null
          ? [String(target)]
          : [];
      if (fields.includes("shopName")) {
        return res.status(409).json({
          errors: [
            {
              field: "shopName",
              message: "Ця назва магазину вже зайнята",
            },
          ],
        });
      }
      return res.status(409).json({ message: "Цей email уже зареєстровано" });
    }
  }
  console.error(err);
  return res.status(500).json({ message: "Внутрішня помилка сервера" });
}
