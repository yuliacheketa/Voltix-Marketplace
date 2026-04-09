import type { NextFunction, Request, Response } from "express";
import type { ZodSchema, ZodTypeAny } from "zod";
import { ZodError } from "zod";

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body) as Request["body"];
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          success: false,
          errors: err.issues.map((i) => ({
            field: i.path.length ? i.path.join(".") : "body",
            message: i.message,
          })),
        });
      }
      next(err);
    }
  };
}

export function validate(parts: {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}) {
  return (req: Request, res: Response, next: NextFunction) => {
    const errors: { field: string; message: string }[] = [];
    if (parts.body) {
      const r = parts.body.safeParse(req.body);
      if (!r.success) {
        for (const i of r.error.issues) {
          errors.push({
            field: i.path.length ? `body.${i.path.join(".")}` : "body",
            message: i.message,
          });
        }
      } else {
        req.body = r.data;
      }
    }
    if (parts.query) {
      const r = parts.query.safeParse(req.query);
      if (!r.success) {
        for (const i of r.error.issues) {
          errors.push({
            field: i.path.length ? `query.${i.path.join(".")}` : "query",
            message: i.message,
          });
        }
      } else {
        Object.assign(req.query as Record<string, unknown>, r.data as object);
      }
    }
    if (parts.params) {
      const r = parts.params.safeParse(req.params);
      if (!r.success) {
        for (const i of r.error.issues) {
          errors.push({
            field: i.path.length ? `params.${i.path.join(".")}` : "params",
            message: i.message,
          });
        }
      } else {
        req.params = {
          ...req.params,
          ...(r.data as object),
        } as Request["params"];
      }
    }
    if (errors.length) {
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
}
