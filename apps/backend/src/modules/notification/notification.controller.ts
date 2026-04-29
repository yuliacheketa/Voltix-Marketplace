import type { Request, Response } from "express";
import { z } from "zod";
import * as notificationService from "./notification.service";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export async function getNotifications(req: Request, res: Response) {
  const userId = req.user!.userId;
  const parsed = listQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      errors: [{ message: "Invalid query" }],
    });
  }
  const data = await notificationService.listNotifications(
    userId,
    parsed.data.page,
    parsed.data.limit
  );
  return res.json({ success: true, data });
}

export async function patchRead(req: Request, res: Response) {
  const userId = req.user!.userId;
  const id = z.string().uuid().safeParse(req.params.notificationId);
  if (!id.success) {
    return res.status(404).json({
      success: false,
      errors: [{ message: "Not found" }],
    });
  }
  await notificationService.markNotificationRead(userId, id.data);
  return res.json({ success: true, data: {} });
}

export async function patchReadAll(req: Request, res: Response) {
  const userId = req.user!.userId;
  const data = await notificationService.markAllNotificationsRead(userId);
  return res.json({ success: true, data });
}
