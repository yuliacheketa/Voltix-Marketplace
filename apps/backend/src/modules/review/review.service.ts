import { OrderStatus } from "@prisma/client";
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
      variant: { select: { productId: true } },
    },
  });
  if (!item) {
    throw new HttpError(404, "Позицію замовлення не знайдено");
  }
  if (item.order.userId !== userId) {
    throw new HttpError(403, "Доступ заборонено");
  }
  if (item.order.status !== OrderStatus.DELIVERED) {
    throw new HttpError(400, "Відгук можна залишити після доставки замовлення");
  }
  const existing = await prisma.review.findUnique({
    where: { orderItemId: input.orderItemId },
  });
  if (existing) {
    throw new HttpError(409, "Для цієї позиції вже є відгук");
  }
  return prisma.review.create({
    data: {
      productId: item.variant.productId,
      userId,
      orderItemId: input.orderItemId,
      rating: input.rating,
      title: input.title,
      body: input.body,
    },
  });
}
