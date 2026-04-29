import { randomBytes } from "crypto";
import {
  NotificationType,
  Prisma,
  ProductStatus,
  SellerOrderStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import type {
  CreateProductInput,
  ProductsQuery,
  SellerOrdersQuery,
  UpdateProductInput,
  UpdateSellerInput,
} from "./seller.validation";

export async function getSellerProfileByUserId(userId: string) {
  return prisma.sellerProfile.findUnique({
    where: { userId },
  });
}

export async function getMeResponse(userId: string) {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    return null;
  }
  return {
    id: profile.id,
    shopName: profile.shopName,
    description: profile.description,
    logoUrl: profile.logoUrl,
    bannerUrl: profile.bannerUrl,
    status: profile.status,
    rating: profile.rating,
    totalSales: profile.totalSales,
    isVerified: profile.isVerified,
    createdAt: profile.createdAt,
  };
}

export async function patchSeller(userId: string, body: UpdateSellerInput) {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new HttpError(404, "Seller profile not found");
  }
  const data: Prisma.SellerProfileUpdateInput = {};
  if (body.shopName !== undefined) data.shopName = body.shopName;
  if (body.description !== undefined) data.description = body.description;
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl;
  if (body.bannerUrl !== undefined) data.bannerUrl = body.bannerUrl;
  try {
    const updated = await prisma.sellerProfile.update({
      where: { id: profile.id },
      data,
      select: {
        id: true,
        shopName: true,
        description: true,
        logoUrl: true,
        bannerUrl: true,
        status: true,
        rating: true,
        totalSales: true,
        isVerified: true,
        createdAt: true,
      },
    });
    return updated;
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      throw new HttpError(409, "Shop name already taken");
    }
    throw e;
  }
}

function slugify(name: string): string {
  const s = name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return s || "product";
}

async function uniqueProductSlug(
  tx: Prisma.TransactionClient,
  base: string
): Promise<string> {
  for (let i = 0; i < 12; i++) {
    const suffix = randomBytes(3).toString("hex");
    const slug = `${base}-${suffix}`;
    const exists = await tx.product.findUnique({ where: { slug } });
    if (!exists) return slug;
  }
  throw new HttpError(500, "Could not generate slug");
}

export async function listProducts(sellerProfileId: string, q: ProductsQuery) {
  const skip = (q.page - 1) * q.limit;
  const where: Prisma.ProductWhereInput = { sellerId: sellerProfileId };
  if (q.status) where.status = q.status;
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: q.limit,
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" } },
      },
    }),
  ]);
  const totalPages = total === 0 ? 0 : Math.ceil(total / q.limit);
  const products = rows.map((p) => {
    const main = p.images.find((im) => im.isMain) ?? p.images[0] ?? null;
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      basePrice: p.basePrice.toString(),
      status: p.status,
      rating: p.rating,
      reviewCount: p.reviewCount,
      totalSold: p.totalSold,
      createdAt: p.createdAt,
      categoryName: p.category.name,
      mainImageUrl: main?.url ?? null,
    };
  });
  return {
    products,
    pagination: { page: q.page, limit: q.limit, total, totalPages },
  };
}

export async function getProductForSeller(
  sellerProfileId: string,
  productId: string
) {
  const p = await prisma.product.findFirst({
    where: { id: productId, sellerId: sellerProfileId },
    include: {
      category: { select: { id: true, name: true } },
      images: { orderBy: { position: "asc" } },
      attributes: true,
      variants: true,
    },
  });
  return p;
}

export async function createProduct(
  sellerProfileId: string,
  input: CreateProductInput
) {
  const base = slugify(input.name);
  return prisma.$transaction(async (tx) => {
    const slug = await uniqueProductSlug(tx, base);
    const product = await tx.product.create({
      data: {
        sellerId: sellerProfileId,
        categoryId: input.categoryId,
        name: input.name,
        slug,
        description: input.description,
        basePrice: new Prisma.Decimal(String(input.basePrice)),
        status: ProductStatus.DRAFT,
        images: {
          create: input.images.map((im, idx) => ({
            url: im.url,
            altText: im.altText ?? null,
            isMain: im.isMain,
            position: idx,
          })),
        },
        attributes: {
          create: (input.attributes ?? []).map((a) => ({
            name: a.name,
            value: a.value,
          })),
        },
        variants: {
          create: input.variants.map((v) => ({
            name: v.name,
            value: v.value,
            price: new Prisma.Decimal(String(v.price)),
            stock: v.stock,
            sku: v.sku ?? null,
          })),
        },
      },
      select: { id: true },
    });
    return product;
  });
}

export async function updateProduct(
  sellerProfileId: string,
  productId: string,
  input: UpdateProductInput
) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, sellerId: sellerProfileId },
  });
  if (!existing) {
    return null;
  }
  if (Object.keys(input).length === 0) {
    return getProductForSeller(sellerProfileId, productId);
  }
  const hasFieldChange =
    input.name !== undefined ||
    input.categoryId !== undefined ||
    input.description !== undefined ||
    input.basePrice !== undefined ||
    input.attributes !== undefined ||
    input.variants !== undefined ||
    input.images !== undefined;

  let nextStatus = existing.status;
  if (existing.status === ProductStatus.ACTIVE && hasFieldChange) {
    nextStatus = ProductStatus.PENDING;
  }

  return prisma.$transaction(async (tx) => {
    const data: Prisma.ProductUpdateInput = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.categoryId !== undefined)
      data.category = { connect: { id: input.categoryId } };
    if (input.description !== undefined) data.description = input.description;
    if (input.basePrice !== undefined)
      data.basePrice = new Prisma.Decimal(String(input.basePrice));
    if (hasFieldChange) data.status = nextStatus;

    if (input.images !== undefined) {
      await tx.productImage.deleteMany({ where: { productId } });
      data.images = {
        create: input.images.map((im, idx) => ({
          url: im.url,
          altText: im.altText ?? null,
          isMain: im.isMain,
          position: idx,
        })),
      };
    }

    if (input.attributes !== undefined) {
      await tx.productAttribute.deleteMany({ where: { productId } });
      data.attributes = {
        create: input.attributes.map((a) => ({
          name: a.name,
          value: a.value,
        })),
      };
    }

    if (input.variants !== undefined) {
      try {
        await tx.productVariant.deleteMany({ where: { productId } });
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
          throw new HttpError(
            400,
            "Cannot replace variants: product has existing orders"
          );
        }
        throw e;
      }
      data.variants = {
        create: input.variants.map((v) => ({
          name: v.name,
          value: v.value,
          price: new Prisma.Decimal(String(v.price)),
          stock: v.stock,
          sku: v.sku ?? null,
        })),
      };
    }

    const updated = await tx.product.update({
      where: { id: productId },
      data,
      include: {
        category: { select: { id: true, name: true } },
        images: true,
        attributes: true,
        variants: true,
      },
    });
    return updated;
  });
}

export async function archiveProduct(
  sellerProfileId: string,
  productId: string
) {
  const existing = await prisma.product.findFirst({
    where: { id: productId, sellerId: sellerProfileId },
  });
  if (!existing) {
    return null;
  }
  await prisma.product.update({
    where: { id: productId },
    data: { status: ProductStatus.ARCHIVED },
  });
  return { ok: true as const };
}

export async function listSellerOrders(
  sellerProfileId: string,
  q: SellerOrdersQuery
) {
  const skip = (q.page - 1) * q.limit;
  const where: Prisma.SellerOrderWhereInput = { sellerId: sellerProfileId };
  if (q.status) where.status = q.status;
  const [total, rows] = await Promise.all([
    prisma.sellerOrder.count({ where }),
    prisma.sellerOrder.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: q.limit,
      include: {
        order: {
          include: {
            address: { select: { city: true, country: true } },
            items: {
              where: {
                variant: { product: { sellerId: sellerProfileId } },
              },
            },
          },
        },
      },
    }),
  ]);
  const totalPages = total === 0 ? 0 : Math.ceil(total / q.limit);
  const orders = rows.map((so) => ({
    id: so.id,
    status: so.status,
    totalAmount: so.totalAmount.toString(),
    createdAt: so.order.createdAt,
    address: {
      city: so.order.address.city,
      country: so.order.address.country,
    },
    items: so.order.items.map((it) => ({
      productName: it.productName,
      variantName: it.variantName,
      quantity: it.quantity,
      unitPrice: it.unitPrice.toString(),
      totalPrice: it.totalPrice.toString(),
    })),
  }));
  return {
    orders,
    pagination: { page: q.page, limit: q.limit, total, totalPages },
  };
}

const forwardMap: Record<SellerOrderStatus, SellerOrderStatus[] | null> = {
  [SellerOrderStatus.PENDING]: [SellerOrderStatus.PROCESSING],
  [SellerOrderStatus.PROCESSING]: [SellerOrderStatus.SHIPPED],
  [SellerOrderStatus.SHIPPED]: [],
  [SellerOrderStatus.DELIVERED]: [],
  [SellerOrderStatus.CANCELLED]: [],
  [SellerOrderStatus.REFUNDED]: [],
};

export async function patchSellerOrderStatus(
  sellerProfileId: string,
  sellerOrderId: string,
  next: "PROCESSING" | "SHIPPED"
) {
  const nextEnum =
    next === "PROCESSING"
      ? SellerOrderStatus.PROCESSING
      : SellerOrderStatus.SHIPPED;
  const so = await prisma.sellerOrder.findFirst({
    where: { id: sellerOrderId, sellerId: sellerProfileId },
    include: { order: { select: { id: true, userId: true } } },
  });
  if (!so) {
    return null;
  }
  const allowed = forwardMap[so.status];
  if (!allowed || !allowed.includes(nextEnum)) {
    throw new HttpError(400, "Invalid status transition");
  }
  const updated = await prisma.sellerOrder.update({
    where: { id: sellerOrderId },
    data: { status: nextEnum },
  });
  await prisma.notification.create({
    data: {
      userId: so.order.userId,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Order update",
      body: `Order ${so.order.id} status: ${nextEnum}`,
    },
  });
  return updated;
}

export async function getDashboardStats(sellerProfileId: string) {
  const [revenueAgg, totalOrders, pendingOrders, activeProducts, products] =
    await Promise.all([
      prisma.sellerOrder.aggregate({
        where: {
          sellerId: sellerProfileId,
          status: SellerOrderStatus.DELIVERED,
        },
        _sum: { totalAmount: true },
      }),
      prisma.sellerOrder.count({ where: { sellerId: sellerProfileId } }),
      prisma.sellerOrder.count({
        where: {
          sellerId: sellerProfileId,
          status: SellerOrderStatus.PENDING,
        },
      }),
      prisma.product.count({
        where: {
          sellerId: sellerProfileId,
          status: ProductStatus.ACTIVE,
        },
      }),
      prisma.product.findMany({
        where: { sellerId: sellerProfileId },
        select: { rating: true, reviewCount: true },
      }),
    ]);

  let weighted = 0;
  let reviews = 0;
  for (const p of products) {
    weighted += p.rating * p.reviewCount;
    reviews += p.reviewCount;
  }
  const averageRating = reviews > 0 ? weighted / reviews : 0;

  return {
    totalRevenue: revenueAgg._sum.totalAmount?.toString() ?? "0",
    totalOrders,
    pendingOrders,
    totalProducts: activeProducts,
    averageRating: Math.round(averageRating * 10) / 10,
  };
}

export async function listCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });
}
