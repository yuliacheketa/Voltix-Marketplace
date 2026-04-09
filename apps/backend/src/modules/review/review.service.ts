import { NotificationType, OrderStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

export type CreateReviewInput = {
  orderItemId: string;
  rating: number;
  title?: string;
  body?: string;
};

export async function createReview(userId: string, input: CreateReviewInput) {
  const item = await prisma.orderItem.findUnique({
    where: { id: input.orderItemId },
    include: {
      order: true,
      variant: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              seller: { select: { userId: true } },
            },
          },
        },
      },
    },
  });
  if (!item) {
    throw new HttpError(404, "Not found");
  }
  if (item.order.userId !== userId) {
    throw new HttpError(403, "Forbidden");
  }
  if (item.order.status !== OrderStatus.DELIVERED) {
    throw new HttpError(400, "Can only review delivered orders");
  }
  const existing = await prisma.review.findUnique({
    where: { orderItemId: input.orderItemId },
  });
  if (existing) {
    throw new HttpError(409, "Already reviewed");
  }

  const productId = item.variant.product.id;
  const productName = item.variant.product.name;
  const sellerUserId = item.variant.product.seller.userId;

  const review = await prisma.$transaction(async (tx) => {
    const created = await tx.review.create({
      data: {
        productId,
        userId,
        orderItemId: input.orderItemId,
        rating: input.rating,
        title: input.title,
        body: input.body,
      },
    });
    const agg = await tx.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { _all: true },
    });
    await tx.product.update({
      where: { id: productId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count._all,
      },
    });
    return created;
  });

  await prisma.notification.create({
    data: {
      userId: sellerUserId,
      type: NotificationType.NEW_REVIEW,
      title: "New review",
      body: `${productName}: ${input.rating} stars`,
    },
  });

  return {
    review: {
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      createdAt: review.createdAt,
    },
  };
}
