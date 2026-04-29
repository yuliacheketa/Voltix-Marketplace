import { NotificationType, OrderStatus, PaymentStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

function alreadyProcessedError() {
  return new HttpError(400, "Payment already processed", {
    success: false,
    errors: [{ message: "Payment already processed" }],
  });
}

function fakeTransactionId() {
  return `TXN-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export async function confirmPayment(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          sellerOrders: { include: { seller: { select: { userId: true } } } },
        },
      },
    },
  });
  if (!payment || payment.order.userId !== userId) {
    throw new HttpError(404, "Not found");
  }
  if (payment.status !== PaymentStatus.PENDING) {
    throw alreadyProcessedError();
  }

  const transactionId = fakeTransactionId();

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        transactionId,
      },
    });
    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAID },
    });
  });

  const orderShort = payment.orderId.slice(0, 8);

  await prisma.notification.create({
    data: {
      userId,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Payment confirmed",
      body: `Payment for order #${orderShort} was successful.`,
    },
  });

  for (const so of payment.order.sellerOrders) {
    await prisma.notification.create({
      data: {
        userId: so.seller.userId,
        type: NotificationType.NEW_ORDER,
        title: "Order paid",
        body: `Order #${orderShort} has been paid and is awaiting processing.`,
      },
    });
  }

  const updated = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: {
      id: true,
      status: true,
      paidAt: true,
      transactionId: true,
    },
  });
  const ord = await prisma.order.findUniqueOrThrow({
    where: { id: payment.orderId },
    select: { id: true, status: true },
  });

  return {
    payment: updated,
    order: ord,
  };
}

export async function failPayment(
  userId: string,
  paymentId: string,
  failureReason?: string
) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: { select: { id: true, productId: true } },
            },
          },
        },
      },
    },
  });
  if (!payment || payment.order.userId !== userId) {
    throw new HttpError(404, "Not found");
  }
  if (payment.status !== PaymentStatus.PENDING) {
    throw alreadyProcessedError();
  }

  const reason = failureReason?.trim() || "Payment declined";

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: reason,
      },
    });

    for (const item of payment.order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { increment: item.quantity } },
      });
      await tx.product.update({
        where: { id: item.variant.productId },
        data: { totalSold: { decrement: item.quantity } },
      });
    }
  });

  const orderShort = payment.orderId.slice(0, 8);
  await prisma.notification.create({
    data: {
      userId,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Payment failed",
      body: `Payment for order #${orderShort} failed. Please try again.`,
    },
  });

  const pay = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: { id: true, status: true, failureReason: true },
  });
  const ord = await prisma.order.findUniqueOrThrow({
    where: { id: payment.orderId },
    select: { id: true, status: true },
  });

  return { payment: pay, order: ord };
}

export async function retryPayment(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      order: {
        include: {
          items: {
            include: {
              variant: {
                select: {
                  id: true,
                  productId: true,
                  stock: true,
                },
              },
            },
          },
        },
      },
    },
  });
  if (!payment || payment.order.userId !== userId) {
    throw new HttpError(404, "Not found");
  }
  if (payment.status !== PaymentStatus.FAILED) {
    throw new HttpError(400, "Only failed payments can be retried", {
      success: false,
      errors: [{ message: "Only failed payments can be retried" }],
    });
  }

  const stockIssues: Array<{
    variantId: string;
    productName: string;
    needed: number;
    available: number;
  }> = [];

  for (const item of payment.order.items) {
    if (item.quantity > item.variant.stock) {
      stockIssues.push({
        variantId: item.variantId,
        productName: item.productName,
        needed: item.quantity,
        available: item.variant.stock,
      });
    }
  }

  if (stockIssues.length > 0) {
    throw new HttpError(400, "Insufficient stock to retry payment", {
      success: false,
      errors: [{ message: "Insufficient stock to retry payment" }],
      data: { stockIssues },
    });
  }

  await prisma.$transaction(async (tx) => {
    for (const item of payment.order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { stock: { decrement: item.quantity } },
      });
      await tx.product.update({
        where: { id: item.variant.productId },
        data: { totalSold: { increment: item.quantity } },
      });
    }

    await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.PENDING,
        failureReason: null,
        transactionId: null,
      },
    });
  });

  const pay = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    select: { id: true, status: true },
  });
  const ord = await prisma.order.findUniqueOrThrow({
    where: { id: payment.orderId },
    select: { id: true, status: true },
  });

  return { payment: pay, order: ord };
}
