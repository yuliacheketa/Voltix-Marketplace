import { ProductStatus, SellerOrderStatus } from "@prisma/client";
import { z } from "zod";

export const updateSellerSchema = z.object({
  shopName: z.string().trim().min(2).max(100).optional(),
  description: z.union([z.string().trim().max(1000), z.null()]).optional(),
  logoUrl: z.union([z.string().url().max(500), z.null()]).optional(),
  bannerUrl: z.union([z.string().url().max(500), z.null()]).optional(),
});

const imageRow = z.object({
  url: z.string().url(),
  altText: z.string().optional(),
  isMain: z.boolean(),
});

const variantRow = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(100),
  price: z.number().positive().max(999999.99),
  stock: z.number().int().min(0),
  sku: z.string().max(100).optional(),
});

const attrRow = z.object({
  name: z.string().min(1).max(100),
  value: z.string().min(1).max(500),
});

export const createProductSchema = z
  .object({
    name: z.string().trim().min(2).max(200),
    categoryId: z.string().uuid(),
    description: z.string().trim().min(10).max(5000),
    basePrice: z.number().positive().max(999999.99),
    attributes: z.array(attrRow).max(20).optional(),
    variants: z.array(variantRow).min(1),
    images: z.array(imageRow).min(1),
  })
  .superRefine((data, ctx) => {
    const mains = data.images.filter((i) => i.isMain).length;
    if (mains !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Exactly one image must be main",
        path: ["images"],
      });
    }
  });

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(2).max(200).optional(),
    categoryId: z.string().uuid().optional(),
    description: z.string().trim().min(10).max(5000).optional(),
    basePrice: z.number().positive().max(999999.99).optional(),
    attributes: z.array(attrRow).max(20).optional(),
    variants: z.array(variantRow).min(1).optional(),
    images: z.array(imageRow).min(1).optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.images) {
      const mains = data.images.filter((i) => i.isMain).length;
      if (mains !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exactly one image must be main",
          path: ["images"],
        });
      }
    }
  });

export const productsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.nativeEnum(ProductStatus).optional(),
});

export const sellerOrdersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.nativeEnum(SellerOrderStatus).optional(),
});

export const patchSellerOrderStatusSchema = z.object({
  status: z.enum(["PROCESSING", "SHIPPED"]),
});

export type UpdateSellerInput = z.infer<typeof updateSellerSchema>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductsQuery = z.infer<typeof productsQuerySchema>;
export type SellerOrdersQuery = z.infer<typeof sellerOrdersQuerySchema>;
