import { OrderStatus, Prisma, SellerOrderStatus } from "@prisma/client";
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
