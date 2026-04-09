import type { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { prisma } from "../../lib/prisma";
import { HttpError } from "../../middleware/errorHandler";
import { AVATAR_PUBLIC_PREFIX, AVATARS_DIR } from "./user.avatarStorage";
import type {
  ChangePasswordBody,
  CreateAddressBody,
  UpdateAddressBody,
  UpdateProfileBody,
} from "./user.validation";

async function unlinkIfLocalAvatar(url: string | null) {
  if (!url?.startsWith(AVATAR_PUBLIC_PREFIX)) return;
  const name = url.slice(AVATAR_PUBLIC_PREFIX.length);
  if (
    !name ||
    name.includes("..") ||
    name.includes("/") ||
    name.includes("\\")
  ) {
    return;
  }
  const filePath = path.join(AVATARS_DIR, name);
  await fs.unlink(filePath).catch(() => {});
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      country: true,
      isDefault: true,
    },
  });
  return { user, addresses };
}

export async function listAddressesForUser(userId: string) {
  return prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      country: true,
      isDefault: true,
    },
  });
}

const profileSelect = {
  id: true,
  email: true,
  name: true,
  phone: true,
  avatarUrl: true,
  role: true,
  isVerified: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

export async function updateProfile(userId: string, body: UpdateProfileBody) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }
  if (body.avatarUrl !== undefined && body.avatarUrl !== existing.avatarUrl) {
    await unlinkIfLocalAvatar(existing.avatarUrl);
  }
  const data: Prisma.UserUpdateInput = {};
  if (body.name !== undefined) {
    data.name = body.name;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone;
  }
  if (body.avatarUrl !== undefined) {
    data.avatarUrl = body.avatarUrl;
  }
  return prisma.user.update({
    where: { id: userId },
    data,
    select: profileSelect,
  });
}

export async function replaceAvatarWithUpload(
  userId: string,
  filename: string
) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarUrl: true },
  });
  if (!existing) {
    throw new HttpError(404, "User not found");
  }
  await unlinkIfLocalAvatar(existing.avatarUrl);
  const newUrl = `${AVATAR_PUBLIC_PREFIX}${filename}`;
  return prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: newUrl },
    select: profileSelect,
  });
}

export async function changePassword(
  userId: string,
  input: ChangePasswordBody
) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) {
    throw new HttpError(404, "User not found");
  }
  const match = await bcrypt.compare(input.currentPassword, user.passwordHash);
  if (!match) {
    return { ok: false as const, reason: "BAD_CURRENT" as const };
  }
  const hash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: hash },
  });
  return { ok: true as const };
}

export async function listOrders(userId: string, page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [total, rows] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      include: {
        items: {
          include: {
            review: { select: { id: true } },
          },
        },
        payment: { select: { status: true } },
      },
    }),
  ]);
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);
  const orders = rows.map((o) => ({
    id: o.id,
    status: o.status,
    totalAmount: o.totalAmount.toString(),
    deliveryCost: o.deliveryCost.toString(),
    createdAt: o.createdAt,
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      variantName: i.variantName,
      quantity: i.quantity,
      unitPrice: i.unitPrice.toString(),
      totalPrice: i.totalPrice.toString(),
      reviewed: i.review != null,
    })),
    payment: o.payment ? { status: o.payment.status } : null,
  }));
  return {
    orders,
    pagination: { page, limit, total, totalPages },
  };
}

export async function createAddress(userId: string, body: CreateAddressBody) {
  const count = await prisma.address.count({ where: { userId } });
  if (count >= 10) {
    return { ok: false as const, code: "MAX_ADDRESSES" as const };
  }
  if (body.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  const address = await prisma.address.create({
    data: {
      userId,
      label: body.label ?? null,
      fullName: body.fullName,
      phone: body.phone,
      street: body.street,
      city: body.city,
      state: body.state ?? null,
      zip: body.zip,
      country: body.country,
      isDefault: body.isDefault ?? false,
    },
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      country: true,
      isDefault: true,
    },
  });
  return { ok: true as const, address };
}

export async function updateAddress(
  userId: string,
  addressId: string,
  body: UpdateAddressBody
) {
  const existing = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!existing) {
    return null;
  }
  if (body.isDefault === true) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
  const data: Prisma.AddressUpdateInput = {};
  if (body.label !== undefined) {
    data.label = body.label;
  }
  if (body.fullName !== undefined) {
    data.fullName = body.fullName;
  }
  if (body.phone !== undefined) {
    data.phone = body.phone;
  }
  if (body.street !== undefined) {
    data.street = body.street;
  }
  if (body.city !== undefined) {
    data.city = body.city;
  }
  if (body.state !== undefined) {
    data.state = body.state;
  }
  if (body.zip !== undefined) {
    data.zip = body.zip;
  }
  if (body.country !== undefined) {
    data.country = body.country;
  }
  if (body.isDefault !== undefined) {
    data.isDefault = body.isDefault;
  }
  if (Object.keys(data).length === 0) {
    return {
      id: existing.id,
      label: existing.label,
      fullName: existing.fullName,
      phone: existing.phone,
      street: existing.street,
      city: existing.city,
      state: existing.state,
      zip: existing.zip,
      country: existing.country,
      isDefault: existing.isDefault,
    };
  }
  return prisma.address.update({
    where: { id: addressId },
    data,
    select: {
      id: true,
      label: true,
      fullName: true,
      phone: true,
      street: true,
      city: true,
      state: true,
      zip: true,
      country: true,
      isDefault: true,
    },
  });
}

export async function deleteAddress(userId: string, addressId: string) {
  const addr = await prisma.address.findFirst({
    where: { id: addressId, userId },
  });
  if (!addr) {
    return null;
  }
  const wasDefault = addr.isDefault;
  await prisma.address.delete({ where: { id: addressId } });
  if (wasDefault) {
    const next = await prisma.address.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    if (next) {
      await prisma.address.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }
  return { ok: true as const };
}
