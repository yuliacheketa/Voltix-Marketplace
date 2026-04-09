import {
  NotificationType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  Prisma,
  ProductStatus,
  SellerOrderStatus,
  SellerStatus,
} from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

export type CreateOrderLineInput = { variantId: string; quantity: number };

export type CreateOrderWithSellerOrdersInput = {
  userId: string;
  addressId: string;
  deliveryMethod: string;
  deliveryCost: Prisma.Decimal;
  lines: CreateOrderLineInput[];
  orderStatus?: OrderStatus;
  sellerOrderStatus?: SellerOrderStatus;
  note?: string;
};

export async function createOrderWithSellerOrders(
  input: CreateOrderWithSellerOrdersInput
) {
  const mergedQty = new Map<string, number>();
  for (const line of input.lines) {
    mergedQty.set(
      line.variantId,
      (mergedQty.get(line.variantId) ?? 0) + line.quantity
    );
  }
  const variantIds = [...mergedQty.keys()];
  return prisma.$transaction(async (tx) => {
    const address = await tx.address.findFirst({
      where: { id: input.addressId, userId: input.userId },
    });
    if (!address) {
      throw new HttpError(404, "Адресу не знайдено");
    }
    const variants = await tx.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: { select: { id: true, name: true, sellerId: true } },
      },
    });
    if (variants.length !== variantIds.length) {
      throw new HttpError(400, "Один або кілька варіантів товару не знайдено");
    }
    type ItemRow = {
      variantId: string;
      productName: string;
      variantName: string;
      quantity: number;
      unitPrice: Prisma.Decimal;
      totalPrice: Prisma.Decimal;
      sellerId: string;
    };
    const rows: ItemRow[] = [];
    for (const v of variants) {
      const qty = mergedQty.get(v.id);
      if (qty == null) {
        throw new HttpError(400, "Некоректний рядок замовлення");
      }
      const unitPrice = new Prisma.Decimal(v.price);
      const totalPrice = unitPrice.times(qty);
      rows.push({
        variantId: v.id,
        productName: v.product.name,
        variantName: `${v.name}: ${v.value}`,
        quantity: qty,
        unitPrice,
        totalPrice,
        sellerId: v.product.sellerId,
      });
    }
    let goodsTotal = new Prisma.Decimal(0);
    for (const r of rows) {
      goodsTotal = goodsTotal.plus(r.totalPrice);
    }
    const deliveryCost = new Prisma.Decimal(input.deliveryCost);
    const totalAmount = goodsTotal.plus(deliveryCost);
    const order = await tx.order.create({
      data: {
        userId: input.userId,
        addressId: input.addressId,
        status: input.orderStatus ?? OrderStatus.PENDING,
        totalAmount,
        deliveryMethod: input.deliveryMethod,
        deliveryCost,
        note: input.note,
        items: {
          create: rows.map((r) => ({
            variantId: r.variantId,
            productName: r.productName,
            variantName: r.variantName,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            totalPrice: r.totalPrice,
          })),
        },
      },
      include: { items: true },
    });
    const bySeller = new Map<string, Prisma.Decimal>();
    for (const r of rows) {
      const prev = bySeller.get(r.sellerId) ?? new Prisma.Decimal(0);
      bySeller.set(r.sellerId, prev.plus(r.totalPrice));
    }
    await tx.sellerOrder.createMany({
      data: [...bySeller.entries()].map(([sellerId, sellerTotal]) => ({
        orderId: order.id,
        sellerId,
        status: input.sellerOrderStatus ?? SellerOrderStatus.PENDING,
        totalAmount: sellerTotal,
      })),
    });
    return order;
  });
}

export async function listSellerOrdersForUser(userId: string) {
  const profile = await prisma.sellerProfile.findUnique({
    where: { userId },
  });
  if (!profile) {
    throw new HttpError(404, "Профіль продавця не знайдено");
  }
  return prisma.sellerOrder.findMany({
    where: { sellerId: profile.id },
    include: {
      order: {
        include: {
          items: {
            where: {
              variant: { product: { sellerId: profile.id } },
            },
            include: {
              variant: {
                include: {
                  product: {
                    select: { id: true, name: true, slug: true },
                  },
                },
              },
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export type PlaceOrderFromCartInput = {
  userId: string;
  addressId: string;
  deliveryMethod: string;
  deliveryCost: Prisma.Decimal;
  note?: string;
  paymentMethod: PaymentMethod;
};

export async function placeOrderFromCart(input: PlaceOrderFromCartInput) {
  const cart = await prisma.cart.findUnique({
    where: { userId: input.userId },
    include: {
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              sellerId: true,
              seller: { select: { status: true } },
            },
          },
          variant: {
            select: {
              id: true,
              name: true,
              value: true,
              price: true,
              stock: true,
            },
          },
        },
      },
    },
  });
  if (!cart || cart.items.length === 0) {
    throw new HttpError(400, "Cart is empty", {
      success: false,
      errors: [{ message: "Cart is empty" }],
    });
  }

  const address = await prisma.address.findFirst({
    where: { id: input.addressId, userId: input.userId },
  });
  if (!address) {
    throw new HttpError(400, "Address not found", {
      success: false,
      errors: [{ field: "addressId", message: "Address not found" }],
    });
  }

  type ItemRow = {
    variantId: string;
    productId: string;
    productName: string;
    variantName: string;
    quantity: number;
    unitPrice: Prisma.Decimal;
    totalPrice: Prisma.Decimal;
    sellerId: string;
  };
  const rows: ItemRow[] = [];
  const blockedItems: Array<{ productId: string; productName: string }> = [];
  const insufficientStock: Array<{
    productId: string;
    variantId: string;
    productName: string;
    quantity: number;
    stock: number;
  }> = [];

  for (const it of cart.items) {
    const product = it.product;
    let variant = it.variant;
    let vid = it.variantId;
    if (!vid || !variant) {
      const def = await prisma.productVariant.findFirst({
        where: { productId: it.productId },
        orderBy: { id: "asc" },
        select: {
          id: true,
          name: true,
          value: true,
          price: true,
          stock: true,
        },
      });
      if (!def) {
        blockedItems.push({
          productId: product.id,
          productName: product.name,
        });
        continue;
      }
      vid = def.id;
      variant = def;
    }

    if (
      product.status !== ProductStatus.ACTIVE ||
      product.seller.status !== SellerStatus.ACTIVE
    ) {
      blockedItems.push({
        productId: product.id,
        productName: product.name,
      });
      continue;
    }

    if (it.quantity > variant.stock) {
      insufficientStock.push({
        productId: product.id,
        variantId: variant.id,
        productName: product.name,
        quantity: it.quantity,
        stock: variant.stock,
      });
      continue;
    }

    const unitPrice = new Prisma.Decimal(variant.price);
    const totalPrice = unitPrice.times(it.quantity);
    rows.push({
      variantId: variant.id,
      productId: product.id,
      productName: product.name,
      variantName: `${variant.name}: ${variant.value}`,
      quantity: it.quantity,
      unitPrice,
      totalPrice,
      sellerId: product.sellerId,
    });
  }

  if (blockedItems.length > 0 || insufficientStock.length > 0) {
    throw new HttpError(400, "Some items are unavailable or out of stock", {
      success: false,
      errors: [{ message: "Some items are unavailable or out of stock" }],
      data: { blockedItems, insufficientStock },
    });
  }

  let goodsTotal = new Prisma.Decimal(0);
  for (const r of rows) {
    goodsTotal = goodsTotal.plus(r.totalPrice);
  }
  const deliveryCost = new Prisma.Decimal(input.deliveryCost);
  const totalAmount = goodsTotal.plus(deliveryCost);

  const { order, payment } = await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId: input.userId,
        addressId: input.addressId,
        status: OrderStatus.PENDING,
        totalAmount,
        deliveryMethod: input.deliveryMethod,
        deliveryCost,
        note: input.note,
        items: {
          create: rows.map((r) => ({
            variantId: r.variantId,
            productName: r.productName,
            variantName: r.variantName,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
            totalPrice: r.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    for (const r of rows) {
      await tx.productVariant.update({
        where: { id: r.variantId },
        data: { stock: { decrement: r.quantity } },
      });
    }

    for (const r of rows) {
      await tx.product.update({
        where: { id: r.productId },
        data: { totalSold: { increment: r.quantity } },
      });
    }

    const bySeller = new Map<string, Prisma.Decimal>();
    for (const r of rows) {
      const prev = bySeller.get(r.sellerId) ?? new Prisma.Decimal(0);
      bySeller.set(r.sellerId, prev.plus(r.totalPrice));
    }
    await tx.sellerOrder.createMany({
      data: [...bySeller.entries()].map(([sellerId, sellerTotal]) => ({
        orderId: order.id,
        sellerId,
        status: SellerOrderStatus.PENDING,
        totalAmount: sellerTotal,
      })),
    });

    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: totalAmount,
        method: input.paymentMethod,
        status: PaymentStatus.PENDING,
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return { order, payment };
  });

  const orderShort = order.id.slice(0, 8);
  await prisma.notification.create({
    data: {
      userId: input.userId,
      type: NotificationType.ORDER_STATUS_CHANGED,
      title: "Order placed",
      body: `Your order #${orderShort} has been placed.`,
    },
  });

  const sellerOrders = await prisma.sellerOrder.findMany({
    where: { orderId: order.id },
    include: { seller: { select: { userId: true } } },
  });
  for (const so of sellerOrders) {
    await prisma.notification.create({
      data: {
        userId: so.seller.userId,
        type: NotificationType.NEW_ORDER,
        title: "New order",
        body: `You have a new order #${orderShort}.`,
      },
    });
  }

  return {
    order: {
      id: order.id,
      status: order.status,
      totalAmount: order.totalAmount.toString(),
      deliveryMethod: order.deliveryMethod,
      deliveryCost: order.deliveryCost.toString(),
      createdAt: order.createdAt,
    },
    payment: {
      id: payment.id,
      status: payment.status,
      method: payment.method,
      amount: payment.amount.toString(),
    },
  };
}

export async function getOrderDetailForUser(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: {
      items: true,
      address: true,
      payment: true,
      sellerOrders: {
        include: {
          seller: { select: { shopName: true } },
        },
      },
    },
  });
  if (!order) {
    throw new HttpError(404, "Not found");
  }
  return order;
}
