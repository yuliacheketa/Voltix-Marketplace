import type { NextFunction, Request, Response } from "express";
import { Prisma } from "@prisma/client";
import { HttpError } from "../../middleware/errorHandler";
import {
  createOrderWithSellerOrders,
  listSellerOrdersForUser,
} from "./order.service";
import type { CreateOrderBody } from "./order.validation";

export async function createOrder(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const auth = req.authUser;
  if (!auth) {
    throw new HttpError(401, "Потрібна авторизація");
  }
  const body = req.body as CreateOrderBody;
  const deliveryCost = new Prisma.Decimal(String(body.deliveryCost));
  const order = await createOrderWithSellerOrders({
    userId: auth.id,
    addressId: body.addressId,
    deliveryMethod: body.deliveryMethod,
    deliveryCost,
    lines: body.lines,
    note: body.note,
  });
  return res.status(201).json({ order });
}

export async function listSellerOrders(
  req: Request,
  res: Response,
  _next: NextFunction
) {
  const auth = req.authUser;
  if (!auth) {
    throw new HttpError(401, "Потрібна авторизація");
  }
  const sellerOrders = await listSellerOrdersForUser(auth.id);
  return res.json({ sellerOrders });
}
