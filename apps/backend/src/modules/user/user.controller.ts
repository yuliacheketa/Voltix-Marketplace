import type { Request, Response } from "express";
import { z } from "zod";
import * as userService from "./user.service";
import type { UpdateProfileBody } from "./user.validation";
import { ordersQuerySchema } from "./user.validation";

const addressIdParam = z.string().uuid();

export async function getMe(req: Request, res: Response) {
  const userId = req.user!.userId;
  const { user, addresses } = await userService.getProfile(userId);
  return res.status(200).json({
    success: true,
    data: { user, addresses },
  });
}

export async function getMyAddresses(req: Request, res: Response) {
  const userId = req.user!.userId;
  const addresses = await userService.listAddressesForUser(userId);
  return res.status(200).json({
    success: true,
    data: { addresses },
  });
}

export async function patchMe(req: Request, res: Response) {
  const userId = req.user!.userId;
  const body = req.body as UpdateProfileBody;
  const user = await userService.updateProfile(userId, body);
  return res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function postMyAvatar(req: Request, res: Response) {
  const file = req.file;
  if (!file) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Файл не надіслано" }],
    });
  }
  const userId = req.user!.userId;
  const user = await userService.replaceAvatarWithUpload(userId, file.filename);
  return res.status(200).json({
    success: true,
    data: { user },
  });
}

export async function patchPassword(req: Request, res: Response) {
  const userId = req.user!.userId;
  const result = await userService.changePassword(userId, req.body);
  if (!result.ok) {
    return res.status(400).json({
      success: false,
      errors: [
        {
          field: "currentPassword",
          message: "Current password is incorrect",
        },
      ],
    });
  }
  return res.status(200).json({
    success: true,
    data: {},
    message: "Password updated successfully",
  });
}

export async function getMyOrders(req: Request, res: Response) {
  const userId = req.user!.userId;
  const parsed = ordersQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: parsed.error.issues.map((i) => ({
        field: i.path.length ? i.path.join(".") : "query",
        message: i.message,
      })),
    });
  }
  const { page, limit } = parsed.data;
  const { orders, pagination } = await userService.listOrders(
    userId,
    page,
    limit
  );
  return res.status(200).json({
    success: true,
    data: { orders, pagination },
  });
}

export async function postAddress(req: Request, res: Response) {
  const userId = req.user!.userId;
  const out = await userService.createAddress(userId, req.body);
  if (!out.ok) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Maximum 10 addresses allowed" }],
    });
  }
  return res.status(201).json({
    success: true,
    data: { address: out.address },
  });
}

export async function patchAddress(req: Request, res: Response) {
  const userId = req.user!.userId;
  const idParse = addressIdParam.safeParse(req.params.addressId);
  if (!idParse.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Address not found" }],
    });
  }
  const address = await userService.updateAddress(
    userId,
    idParse.data,
    req.body
  );
  if (!address) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Address not found" }],
    });
  }
  return res.status(200).json({
    success: true,
    data: { address },
  });
}

export async function deleteAddress(req: Request, res: Response) {
  const userId = req.user!.userId;
  const idParse = addressIdParam.safeParse(req.params.addressId);
  if (!idParse.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Address not found" }],
    });
  }
  const result = await userService.deleteAddress(userId, idParse.data);
  if (!result) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Address not found" }],
    });
  }
  return res.status(200).json({
    success: true,
    data: {},
    message: "Address deleted",
  });
}
