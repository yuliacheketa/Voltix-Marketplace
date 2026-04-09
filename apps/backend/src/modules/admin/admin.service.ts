import { prisma } from "../../lib/prisma";
import {
  NotificationType,
  OrderStatus,
  PaymentStatus,
  Prisma,
  ProductStatus,
  Role,
  SellerStatus,
} from "@prisma/client";
import { HttpError } from "../../middleware/errorHandler";

export type PageInput = { page: number; limit: number };

export function normalizePaging(input: Partial<PageInput>) {
  const pageRaw = Number(input.page ?? 1);
  const limitRaw = Number(input.limit ?? 20);
  const page =
    Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;
  return { page, limit, skip: (page - 1) * limit };
}

export async function listUsers(input: {
  page: number;
  limit: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}) {
  const { page, limit, skip } = normalizePaging(input);
  const where = {
    ...(input.search
      ? {
          OR: [
            { name: { contains: input.search, mode: "insensitive" as const } },
            { email: { contains: input.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(input.role ? { role: input.role } : {}),
    ...(input.isActive != null ? { isActive: input.isActive } : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    users,
    pagination: { page, limit, total, totalPages },
  };
}

export async function patchUser(
  userId: string,
  input: { isActive?: boolean; role?: Role }
) {
  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, isActive: true },
  });

  if (!current) {
    throw new Error("User not found");
  }

  const demotingAdmin =
    current.role === Role.ADMIN &&
    input.role != null &&
    input.role !== Role.ADMIN;
  const deactivatingAdmin =
    current.role === Role.ADMIN && input.isActive === false;

  if (demotingAdmin || deactivatingAdmin) {
    const activeAdmins = await prisma.user.count({
      where: { role: Role.ADMIN, isActive: true },
    });
    if (activeAdmins <= 1 && current.isActive) {
      throw new Error("Cannot modify the last active ADMIN");
    }
  }

  const data: { isActive?: boolean; role?: Role } = {};
  if (input.isActive != null) data.isActive = input.isActive;
  if (input.role != null) data.role = input.role;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return user;
}

export async function listSellers(input: {
  page: number;
  limit: number;
  search?: string;
  status?: SellerStatus;
}) {
  const { page, limit, skip } = normalizePaging(input);
  const where = {
    ...(input.search
      ? { shopName: { contains: input.search, mode: "insensitive" as const } }
      : {}),
    ...(input.status ? { status: input.status } : {}),
  };

  const [total, sellers] = await Promise.all([
    prisma.sellerProfile.count({ where }),
    prisma.sellerProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        shopName: true,
        status: true,
        isVerified: true,
        rating: true,
        totalSales: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / limit));
  return {
    sellers,
    pagination: { page, limit, total, totalPages },
  };
}

export async function patchSeller(input: {
  sellerId: string;
  status?: SellerStatus;
  isVerified?: boolean;
  rejectionReason?: string | null;
  actorRole: Role;
}) {
  const current = await prisma.sellerProfile.findUnique({
    where: { id: input.sellerId },
    select: { id: true, status: true, userId: true },
  });
  if (!current) return null;

  const nextStatus = input.status;
  const statusChanging = nextStatus != null && nextStatus !== current.status;

  if (input.actorRole === Role.MODERATOR) {
    if (nextStatus != null && nextStatus !== SellerStatus.ACTIVE) {
      return { error: "FORBIDDEN" as const };
    }
  }

  if (
    nextStatus === SellerStatus.SUSPENDED ||
    nextStatus === SellerStatus.BANNED
  ) {
    if (input.actorRole !== Role.ADMIN) {
      return { error: "FORBIDDEN" as const };
    }
    if (!input.rejectionReason || !input.rejectionReason.trim()) {
      return { error: "REJECTION_REASON_REQUIRED" as const };
    }
  }

  const updated = await prisma.sellerProfile.update({
    where: { id: input.sellerId },
    data: {
      ...(nextStatus != null ? { status: nextStatus } : {}),
      ...(input.isVerified != null ? { isVerified: input.isVerified } : {}),
      ...(input.rejectionReason != null
        ? { rejectionReason: input.rejectionReason }
        : {}),
    },
    select: {
      id: true,
      shopName: true,
      status: true,
      isVerified: true,
      rating: true,
      totalSales: true,
      createdAt: true,
      user: { select: { email: true, name: true } },
      userId: true,
    },
  });

  if (statusChanging) {
    if (nextStatus === SellerStatus.ACTIVE) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: "SELLER_APPROVED",
          title: "Seller account approved",
          body: "Your seller account is now active.",
        },
      });
    }
    if (
      nextStatus === SellerStatus.SUSPENDED ||
      nextStatus === SellerStatus.BANNED
    ) {
      await prisma.notification.create({
        data: {
          userId: updated.userId,
          type: "SELLER_SUSPENDED",
          title: "Seller account suspended",
          body: input.rejectionReason?.trim() || "",
        },
      });
    }
  }

  const { userId, ...seller } = updated;
  return { seller };
}

export async function getAdminStats() {
  const [
    totalUsers,
    totalSellers,
    pendingSellers,
    totalProducts,
    pendingProducts,
    totalOrders,
    revenueAgg,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.sellerProfile.count({ where: { status: SellerStatus.ACTIVE } }),
    prisma.sellerProfile.count({ where: { status: SellerStatus.PENDING } }),
    prisma.product.count({ where: { status: ProductStatus.ACTIVE } }),
    prisma.product.count({ where: { status: ProductStatus.PENDING } }),
    prisma.order.count(),
    prisma.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true },
    }),
  ]);
  return {
    totalUsers,
    totalSellers,
    pendingSellers,
    totalProducts,
    pendingProducts,
    totalOrders,
    totalRevenue: revenueAgg._sum.amount?.toString() ?? "0",
  };
}

export async function listAdminProducts(input: {
  page: number;
  limit: number;
  status?: ProductStatus;
  search?: string;
  sellerId?: string;
}) {
  const { page, limit, skip } = normalizePaging(input);
  const where: Prisma.ProductWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.sellerId ? { sellerId: input.sellerId } : {}),
    ...(input.search
      ? { name: { contains: input.search, mode: "insensitive" as const } }
      : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        basePrice: true,
        createdAt: true,
        seller: { select: { shopName: true } },
        category: { select: { name: true } },
        images: {
          where: { isMain: true },
          take: 1,
          select: { url: true },
        },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const products = rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    basePrice: p.basePrice.toString(),
    createdAt: p.createdAt,
    shopName: p.seller.shopName,
    categoryName: p.category.name,
    mainImageUrl: p.images[0]?.url ?? null,
  }));
  return {
    products,
    pagination: { page, limit, total, totalPages },
  };
}

export async function patchAdminProduct(
  productId: string,
  input: { status?: ProductStatus; moderationNote?: string | null }
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { seller: { select: { userId: true } } },
  });
  if (!product) {
    throw new HttpError(404, "Not found");
  }
  if (
    input.status === ProductStatus.REJECTED &&
    (!input.moderationNote || !String(input.moderationNote).trim())
  ) {
    throw new HttpError(400, "moderationNote is required when rejecting");
  }
  const prevStatus = product.status;
  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      ...(input.status != null ? { status: input.status } : {}),
      ...(input.moderationNote !== undefined
        ? { moderationNote: input.moderationNote }
        : {}),
    },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      moderationNote: true,
    },
  });
  if (
    input.status === ProductStatus.ACTIVE &&
    prevStatus !== ProductStatus.ACTIVE
  ) {
    await prisma.notification.create({
      data: {
        userId: product.seller.userId,
        type: NotificationType.PRODUCT_APPROVED,
        title: "Product approved",
        body: updated.name,
      },
    });
  }
  if (input.status === ProductStatus.REJECTED) {
    await prisma.notification.create({
      data: {
        userId: product.seller.userId,
        type: NotificationType.PRODUCT_REJECTED,
        title: "Product rejected",
        body: String(input.moderationNote ?? "").trim() || updated.name,
      },
    });
  }
  return updated;
}

export async function deleteAdminProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } });
}

export async function listAdminOrders(input: {
  page: number;
  limit: number;
  status?: OrderStatus;
  search?: string;
}) {
  const { page, limit, skip } = normalizePaging(input);
  const where: Prisma.OrderWhereInput = {
    ...(input.status ? { status: input.status } : {}),
    ...(input.search && input.search.trim() ? { id: input.search.trim() } : {}),
  };
  const [total, rows] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        user: { select: { email: true } },
        address: { select: { city: true, country: true } },
        payment: { select: { status: true } },
      },
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const orders = rows.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: o.totalAmount.toString(),
    createdAt: o.createdAt,
    userEmail: o.user.email,
    address: { city: o.address.city, country: o.address.country },
    paymentStatus: o.payment?.status ?? null,
  }));
  return { orders, pagination: { page, limit, total, totalPages } };
}

export async function patchAdminOrderStatus(
  orderId: string,
  status: OrderStatus
) {
  const exists = await prisma.order.findUnique({ where: { id: orderId } });
  if (!exists) {
    throw new HttpError(404, "Not found");
  }
  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status },
    });
    if (status === OrderStatus.REFUNDED) {
      await tx.payment.updateMany({
        where: { orderId },
        data: { status: PaymentStatus.REFUNDED },
      });
    }
  });
}
