import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";

export async function listNotifications(
  userId: string,
  page: number,
  limit: number
) {
  const skip = (page - 1) * limit;
  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  return {
    notifications,
    unreadCount,
    pagination: { page, limit, total, totalPages },
  };
}

export async function markNotificationRead(
  userId: string,
  notificationId: string
) {
  const n = await prisma.notification.findFirst({
    where: { id: notificationId, userId },
  });
  if (!n) {
    throw new HttpError(404, "Not found");
  }
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllNotificationsRead(userId: string) {
  const result = await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return { updatedCount: result.count };
}
