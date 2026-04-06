import type { Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import * as sellerService from "./seller.service";
import {
  productsQuerySchema,
  sellerOrdersQuerySchema,
} from "./seller.validation";
import type {
  CreateProductInput,
  UpdateProductInput,
  UpdateSellerInput,
} from "./seller.validation";

async function sellerProfileId(req: Request): Promise<string | null> {
  const userId = req.user?.userId;
  if (!userId) return null;
  const p = await sellerService.getSellerProfileByUserId(userId);
  return p?.id ?? null;
}

export async function getMe(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, errors: [{ message: "Unauthorized" }] });
  }
  const profile = await sellerService.getMeResponse(userId);
  if (!profile) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  return res.json({ success: true, data: { profile } });
}

export async function patchMe(req: Request, res: Response) {
  const userId = req.user?.userId;
  if (!userId) {
    return res
      .status(401)
      .json({ success: false, errors: [{ message: "Unauthorized" }] });
  }
  const body = req.body as UpdateSellerInput;
  try {
    const profile = await sellerService.patchSeller(userId, body);
    return res.json({ success: true, data: { profile } });
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 409) {
      return res.status(409).json({
        errors: [{ field: "shopName", message: "Shop name already taken" }],
      });
    }
    throw e;
  }
}

export async function getProducts(req: Request, res: Response) {
  const parsed = productsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Помилка валідації",
      errors: parsed.error.flatten(),
    });
  }
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const data = await sellerService.listProducts(sellerId, parsed.data);
  return res.json({ success: true, data });
}

export async function getProduct(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const product = await sellerService.getProductForSeller(
    sellerId,
    String(req.params.productId)
  );
  if (!product) {
    return res.status(404).json({ errors: [{ message: "Product not found" }] });
  }
  return res.json({
    success: true,
    data: { product: serializeFullProduct(product) },
  });
}

function serializeFullProduct(
  p: Awaited<ReturnType<typeof sellerService.getProductForSeller>>
) {
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    basePrice: p.basePrice.toString(),
    status: p.status,
    categoryId: p.categoryId,
    category: p.category,
    images: p.images.map((im) => ({
      id: im.id,
      url: im.url,
      altText: im.altText,
      isMain: im.isMain,
      position: im.position,
    })),
    attributes: p.attributes.map((a) => ({
      id: a.id,
      name: a.name,
      value: a.value,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      value: v.value,
      price: v.price.toString(),
      stock: v.stock,
      sku: v.sku,
    })),
  };
}

export async function postProduct(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const body = req.body as CreateProductInput;
  const created = await sellerService.createProduct(sellerId, body);
  return res.status(201).json({ success: true, data: { product: created } });
}

export async function patchProduct(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const body = req.body as UpdateProductInput;
  try {
    const updated = await sellerService.updateProduct(
      sellerId,
      String(req.params.productId),
      body
    );
    if (!updated) {
      return res
        .status(404)
        .json({ errors: [{ message: "Product not found" }] });
    }
    return res.json({
      success: true,
      data: { product: serializeFullProduct(updated) },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        errors: [{ message: e.message }],
      });
    }
    throw e;
  }
}

export async function deleteProduct(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const result = await sellerService.archiveProduct(
    sellerId,
    String(req.params.productId)
  );
  if (!result) {
    return res.status(404).json({ errors: [{ message: "Product not found" }] });
  }
  return res.json({ success: true, message: "Product archived" });
}

export async function getOrders(req: Request, res: Response) {
  const parsed = sellerOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Помилка валідації",
      errors: parsed.error.flatten(),
    });
  }
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const data = await sellerService.listSellerOrders(sellerId, parsed.data);
  return res.json({ success: true, data });
}

export async function patchOrderStatus(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const body = req.body as { status: "PROCESSING" | "SHIPPED" };
  try {
    const order = await sellerService.patchSellerOrderStatus(
      sellerId,
      String(req.params.sellerOrderId),
      body.status
    );
    if (!order) {
      return res.status(404).json({ errors: [{ message: "Order not found" }] });
    }
    return res.json({
      success: true,
      data: {
        order: {
          id: order.id,
          orderId: order.orderId,
          sellerId: order.sellerId,
          status: order.status,
          totalAmount: order.totalAmount.toString(),
          updatedAt: order.updatedAt,
        },
      },
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return res.status(e.statusCode).json({
        errors: [{ message: e.message }],
      });
    }
    throw e;
  }
}

export async function getStats(req: Request, res: Response) {
  const sellerId = await sellerProfileId(req);
  if (!sellerId) {
    return res.status(404).json({
      errors: [{ message: "Seller profile not found" }],
    });
  }
  const stats = await sellerService.getDashboardStats(sellerId);
  return res.json({ success: true, data: { stats } });
}

export async function getCategories(_req: Request, res: Response) {
  const categories = await sellerService.listCategories();
  return res.json({ success: true, data: { categories } });
}
