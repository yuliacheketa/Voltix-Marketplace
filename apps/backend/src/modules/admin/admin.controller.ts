import type { Request, Response } from "express";
import { HttpError } from "../../middleware/errorHandler";
import { OrderStatus, ProductStatus, Role, SellerStatus } from "@prisma/client";
import { z } from "zod";
import * as adminService from "./admin.service";

const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z
    .union([z.literal("true"), z.literal("false")])
    .transform((v) => v === "true")
    .optional(),
});

const patchUserBodySchema = z
  .object({
    isActive: z.boolean().optional(),
    role: z.nativeEnum(Role).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Empty body" });

const listSellersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().trim().min(1).optional(),
  status: z.nativeEnum(SellerStatus).optional(),
});

const patchSellerBodySchema = z
  .object({
    status: z.nativeEnum(SellerStatus).optional(),
    isVerified: z.boolean().optional(),
    rejectionReason: z.string().trim().min(1).optional(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Empty body" });

export async function getUsers(req: Request, res: Response) {
  const parsed = listUsersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query params" }],
    });
  }
  const { page, limit, search, role, isActive } = parsed.data;
  const result = await adminService.listUsers({
    page: page ?? 1,
    limit: limit ?? 20,
    search,
    role,
    isActive,
  });
  return res.status(200).json({
    success: true,
    data: { users: result.users, pagination: result.pagination },
  });
}

export async function patchUser(req: Request, res: Response) {
  const userId = z.string().uuid().safeParse(req.params.userId);
  if (!userId.success) {
    return res
      .status(400)
      .json({ success: false, errors: [{ message: "Invalid userId" }] });
  }

  if (req.user?.userId && req.user.userId === userId.data) {
    return res.status(403).json({
      success: false,
      errors: [{ message: "Cannot modify own admin account" }],
    });
  }

  const parsedBody = patchUserBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ success: false, errors: [{ message: "Invalid body" }] });
  }

  if (parsedBody.data.role === Role.ADMIN) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Cannot set role to ADMIN" }],
    });
  }

  try {
    const user = await adminService.patchUser(userId.data, parsedBody.data);
    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (e) {
    const msg =
      e && typeof e === "object" && "message" in e ? String(e.message) : "";
    if (msg === "User not found") {
      return res
        .status(404)
        .json({ success: false, errors: [{ message: "User not found" }] });
    }
    if (msg === "Cannot modify the last active ADMIN") {
      return res.status(409).json({
        success: false,
        errors: [{ message: "Cannot modify the last active ADMIN" }],
      });
    }
    throw e;
  }
}

export async function getSellers(req: Request, res: Response) {
  const parsed = listSellersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query params" }],
    });
  }
  const { page, limit, search, status } = parsed.data;
  const result = await adminService.listSellers({
    page: page ?? 1,
    limit: limit ?? 20,
    search,
    status,
  });
  return res.status(200).json({
    success: true,
    data: { sellers: result.sellers, pagination: result.pagination },
  });
}

export async function patchSeller(req: Request, res: Response) {
  const sellerId = z.string().uuid().safeParse(req.params.sellerId);
  if (!sellerId.success) {
    return res
      .status(400)
      .json({ success: false, errors: [{ message: "Invalid sellerId" }] });
  }
  const parsedBody = patchSellerBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res
      .status(400)
      .json({ success: false, errors: [{ message: "Invalid body" }] });
  }

  const actorRole = req.user?.role;
  if (!actorRole) {
    return res
      .status(401)
      .json({ success: false, errors: [{ message: "Unauthorized" }] });
  }

  const result = await adminService.patchSeller({
    sellerId: sellerId.data,
    actorRole,
    status: parsedBody.data.status,
    isVerified: parsedBody.data.isVerified,
    rejectionReason:
      parsedBody.data.rejectionReason != null
        ? parsedBody.data.rejectionReason
        : parsedBody.data.status === SellerStatus.SUSPENDED ||
            parsedBody.data.status === SellerStatus.BANNED
          ? req.body?.rejectionReason
          : null,
  });

  if (!result) {
    return res
      .status(404)
      .json({ success: false, errors: [{ message: "Seller not found" }] });
  }
  if ("error" in result) {
    if (result.error === "REJECTION_REASON_REQUIRED") {
      return res.status(400).json({
        success: false,
        errors: [{ message: "rejectionReason is required for this status" }],
      });
    }
    return res
      .status(403)
      .json({ success: false, errors: [{ message: "Forbidden" }] });
  }

  return res.status(200).json({
    success: true,
    data: { seller: result.seller },
  });
}

const adminProductsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(ProductStatus).optional(),
  search: z.string().trim().min(1).optional(),
  sellerId: z.string().uuid().optional(),
});

const patchAdminProductBodySchema = z
  .object({
    status: z.nativeEnum(ProductStatus).optional(),
    moderationNote: z.string().max(2000).optional().nullable(),
  })
  .strict()
  .refine((v) => Object.keys(v).length > 0, { message: "Empty body" });

const adminOrdersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().optional(),
  status: z.nativeEnum(OrderStatus).optional(),
  search: z.string().trim().min(1).optional(),
});

const patchAdminOrderStatusBodySchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export async function getStats(_req: Request, res: Response) {
  const data = await adminService.getAdminStats();
  return res.json({ success: true, data });
}

export async function getAdminProducts(req: Request, res: Response) {
  const parsed = adminProductsQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query params" }],
    });
  }
  const { page, limit, status, search, sellerId } = parsed.data;
  const result = await adminService.listAdminProducts({
    page: page ?? 1,
    limit: limit ?? 20,
    status,
    search,
    sellerId,
  });
  return res.json({
    success: true,
    data: {
      products: result.products,
      pagination: result.pagination,
    },
  });
}

export async function patchAdminProductById(req: Request, res: Response) {
  const productId = z.string().uuid().safeParse(req.params.productId);
  if (!productId.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid productId" }],
    });
  }
  const parsedBody = patchAdminProductBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid body" }],
    });
  }
  try {
    const product = await adminService.patchAdminProduct(
      productId.data,
      parsedBody.data
    );
    return res.json({ success: true, data: { product } });
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 404) {
      return res
        .status(404)
        .json({ success: false, errors: [{ message: "Not found" }] });
    }
    throw e;
  }
}

export async function deleteAdminProductById(req: Request, res: Response) {
  const productId = z.string().uuid().safeParse(req.params.productId);
  if (!productId.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid productId" }],
    });
  }
  await adminService.deleteAdminProduct(productId.data);
  return res.json({ success: true });
}

export async function getAdminOrders(req: Request, res: Response) {
  const parsed = adminOrdersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query params" }],
    });
  }
  const { page, limit, status, search } = parsed.data;
  const result = await adminService.listAdminOrders({
    page: page ?? 1,
    limit: limit ?? 20,
    status,
    search,
  });
  return res.json({
    success: true,
    data: {
      orders: result.orders,
      pagination: result.pagination,
    },
  });
}

export async function patchAdminOrderStatusById(req: Request, res: Response) {
  const orderId = z.string().uuid().safeParse(req.params.orderId);
  if (!orderId.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid orderId" }],
    });
  }
  const parsedBody = patchAdminOrderStatusBodySchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid body" }],
    });
  }
  try {
    await adminService.patchAdminOrderStatus(
      orderId.data,
      parsedBody.data.status
    );
    return res.json({ success: true });
  } catch (e) {
    if (e instanceof HttpError && e.statusCode === 404) {
      return res
        .status(404)
        .json({ success: false, errors: [{ message: "Not found" }] });
    }
    throw e;
  }
}
