import type { Request, Response } from "express";
import { z } from "zod";
import * as catalogService from "./catalog.service";

const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().uuid().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  rating: z.coerce.number().optional(),
  sortBy: z
    .enum(["price_asc", "price_desc", "rating", "newest"])
    .optional()
    .default("newest"),
});

const reviewsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export async function getProducts(req: Request, res: Response) {
  const parsed = productsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query" }],
    });
  }
  const data = await catalogService.listCatalogProducts(parsed.data);
  return res.json({ success: true, data });
}

export async function getProduct(req: Request, res: Response) {
  const slug = String(req.params.slug);
  const data = await catalogService.getCatalogProductBySlug(slug);
  return res.json({ success: true, data: { product: data } });
}

export async function getCategories(_req: Request, res: Response) {
  const data = await catalogService.listCategoryTree();
  return res.json({ success: true, data: { categories: data } });
}

export async function getCategory(req: Request, res: Response) {
  const slug = String(req.params.slug);
  const data = await catalogService.getCategoryBySlug(slug);
  return res.json({ success: true, data: { category: data } });
}

export async function getProductReviews(req: Request, res: Response) {
  const slug = String(req.params.slug);
  const parsed = reviewsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query" }],
    });
  }
  const data = await catalogService.listProductReviews(
    slug,
    parsed.data.page,
    parsed.data.limit
  );
  return res.json({ success: true, data });
}
