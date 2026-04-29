import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import multer from "multer";

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public jsonBody?: Record<string, unknown>
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
  const isProd = process.env.NODE_ENV === "production";
  if (err instanceof HttpError) {
    if (err.jsonBody !== undefined) {
      return res.status(err.statusCode).json(err.jsonBody);
    }
    return res.status(err.statusCode).json({
      success: false,
      errors: [{ message: err.message }],
    });
  }
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        errors: [{ message: "Файл завеликий (максимум 2 МБ)" }],
      });
    }
  }
  if (err instanceof Error && err.message === "INVALID_AVATAR_TYPE") {
    return res.status(400).json({
      success: false,
      errors: [
        {
          message: "Дозволені лише зображення JPEG, PNG, GIF або WebP",
        },
      ],
    });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const target = err.meta?.target;
      const fields = Array.isArray(target)
        ? target.map(String)
        : target != null
          ? [String(target)]
          : [];
      const field = fields[0] ?? "unknown";
      return res.status(409).json({
        success: false,
        errors: [
          {
            field,
            message: "Unique constraint violation",
          },
        ],
      });
    }
    if (err.code === "P2025") {
      return res.status(404).json({
        success: false,
        errors: [{ message: "Not found" }],
      });
    }
  }
  if (!isProd) {
    console.error(err);
  } else {
    console.error(err instanceof Error ? err.message : "Unknown error");
  }
  return res.status(500).json({
    success: false,
    errors: [{ message: "Internal server error" }],
  });
}
