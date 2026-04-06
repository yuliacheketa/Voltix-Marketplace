import type { NextFunction, Request, Response } from "express";
import type { ZodSchema } from "zod";
import { ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as Request["body"];
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Помилка валідації",
          errors: err.flatten().fieldErrors,
        });
      }
      next(err);
    }
  };
}
