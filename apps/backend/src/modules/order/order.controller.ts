import type { Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { getOrderDetailForUser, placeOrderFromCart } from "./order.service";
import type { PlaceOrderFromCartBody } from "./order.validation";

export async function postOrderFromCart(req: Request, res: Response) {
  const userId = req.user!.userId;
  const body = req.body as PlaceOrderFromCartBody;
  const deliveryCost = new Prisma.Decimal(String(body.deliveryCost));
  const result = await placeOrderFromCart({
    userId,
    addressId: body.addressId,
    deliveryMethod: body.deliveryMethod,
    deliveryCost,
    note: body.note,
    paymentMethod: body.paymentMethod,
  });
  return res.status(201).json({ success: true, data: result });
}

export async function getOrderById(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.orderId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const order = await getOrderDetailForUser(userId, id.data);
  const addr = order.address;
  return res.json({
    success: true,
    data: {
      order: {
        id: order.id,
        status: order.status,
        totalAmount: order.totalAmount.toString(),
        deliveryMethod: order.deliveryMethod,
        deliveryCost: order.deliveryCost.toString(),
        note: order.note,
        createdAt: order.createdAt,
        address: {
          fullName: addr.fullName,
          phone: addr.phone,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          zip: addr.zip,
          country: addr.country,
        },
        items: order.items.map((it) => ({
          id: it.id,
          productName: it.productName,
          variantName: it.variantName,
          quantity: it.quantity,
          unitPrice: it.unitPrice.toString(),
          totalPrice: it.totalPrice.toString(),
        })),
        payment: order.payment
          ? {
              id: order.payment.id,
              status: order.payment.status,
              method: order.payment.method,
              amount: order.payment.amount.toString(),
              paidAt: order.payment.paidAt,
              failureReason: order.payment.failureReason,
            }
          : null,
        sellerOrders: order.sellerOrders.map((so) => ({
          id: so.id,
          status: so.status,
          totalAmount: so.totalAmount.toString(),
          seller: { shopName: so.seller.shopName },
        })),
      },
    },
  });
}
