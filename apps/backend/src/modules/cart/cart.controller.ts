import type { Request, Response } from "express";
import { z } from "zod";
import * as cartService from "./cart.service";
import type { AddCartItemBody, PatchCartItemBody } from "./cart.validation";

export async function getCart(req: Request, res: Response) {
  const userId = req.user!.userId;
  const data = await cartService.getCartForUser(userId);
  return res.json({ success: true, data });
}

export async function getCheckoutSummary(req: Request, res: Response) {
  const userId = req.user!.userId;
  const data = await cartService.getCheckoutSummaryForUser(userId);
  return res.json({ success: true, data });
}

export async function postItem(req: Request, res: Response) {
  const userId = req.user!.userId;
  const body = req.body as AddCartItemBody;
  const data = await cartService.addCartItem(userId, body);
  return res.status(201).json({ success: true, data });
}

export async function patchItem(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.cartItemId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const body = req.body as PatchCartItemBody;
  try {
    const data = await cartService.patchCartItem(userId, id.data, body);
    return res.json({ success: true, data });
  } catch (e) {
    throw e;
  }
}

export async function deleteItem(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.cartItemId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  const data = await cartService.removeCartItem(userId, id.data);
  return res.json({ success: true, data });
}

export async function deleteCart(req: Request, res: Response) {
  const userId = req.user!.userId;
  const data = await cartService.clearCart(userId);
  return res.json({ success: true, data });
}
