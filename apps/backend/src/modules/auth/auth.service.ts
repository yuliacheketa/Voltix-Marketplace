import { Role, SellerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { HttpError } from "../../middleware/errorHandler";
import { prisma } from "../../lib/prisma";
import type { LoginInput, RegisterInput } from "./auth.validation";

const SALT_ROUNDS = 10;

function signAccessToken(user: {
  id: string;
  email: string;
  role: Role;
  isVerified: boolean;
}) {
  const secret = process.env.JWT_SECRET;
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  const signOptions: SignOptions = {
    expiresIn: expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    secret,
    signOptions
  );
}

function publicUserFields(user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    avatarUrl: user.avatarUrl,
  };
}

export async function registerUser(input: RegisterInput) {
  if (input.role === Role.MODERATOR || input.role === Role.ADMIN) {
    throw new Error("FORBIDDEN_ROLE");
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const email = input.email.toLowerCase();
  const name = email.split("@")[0] || "User";
  const role = input.role;

  const { user, sellerProfile } = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        isVerified: true,
        emailVerificationToken: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
        avatarUrl: true,
      },
    });
    await tx.cart.create({ data: { userId: created.id } });
    if (role === Role.SELLER) {
      const profile = await tx.sellerProfile.create({
        data: {
          userId: created.id,
          shopName: input.shopName!,
          status: SellerStatus.PENDING,
        },
        select: { id: true, shopName: true, status: true },
      });
      return { user: created, sellerProfile: profile };
    }
    return { user: created, sellerProfile: null };
  });

  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });
  const userPayload = publicUserFields(user);
  if (sellerProfile) {
    return {
      user: userPayload,
      token,
      sellerProfile,
    };
  }
  return {
    user: userPayload,
    token,
  };
}

export async function verifyEmailByToken(token: string) {
  const user = await prisma.user.findFirst({
    where: { emailVerificationToken: token },
    select: { id: true },
  });
  if (!user) {
    throw new HttpError(
      400,
      "Недійсне або прострочене посилання підтвердження"
    );
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, emailVerificationToken: null },
  });
  return {
    ok: true as const,
    message: "Email підтверджено. Можете користуватися акаунтом.",
  };
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email.toLowerCase() },
  });
  if (!user) {
    throw new HttpError(401, "Invalid credentials");
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Invalid credentials");
  }
  if (!user.isActive) {
    throw new HttpError(403, "Account is deactivated", {
      success: false,
      errors: [{ message: "Account is deactivated" }],
    });
  }
  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });
  return {
    user: publicUserFields({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      avatarUrl: user.avatarUrl,
    }),
    token,
  };
}

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      createdAt: true,
      avatarUrl: true,
    },
  });
  if (!user) {
    throw new HttpError(404, "Користувача не знайдено");
  }
  return user;
}

export function refreshAccessToken(existingToken: string) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not set");
  }
  let payload: jwt.JwtPayload;
  try {
    const decoded = jwt.verify(existingToken, secret);
    if (
      typeof decoded === "string" ||
      decoded == null ||
      typeof decoded !== "object"
    ) {
      throw new HttpError(401, "Unauthorized");
    }
    payload = decoded as jwt.JwtPayload;
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, "Unauthorized");
    }
    if (e instanceof HttpError) {
      throw e;
    }
    throw new HttpError(401, "Unauthorized");
  }
  const sub = payload.sub;
  if (typeof sub !== "string") {
    throw new HttpError(401, "Unauthorized");
  }
  const email = payload.email;
  if (typeof email !== "string") {
    throw new HttpError(401, "Unauthorized");
  }
  const roleRaw = payload.role;
  const role =
    typeof roleRaw === "string" &&
    (Object.values(Role) as string[]).includes(roleRaw)
      ? (roleRaw as Role)
      : Role.CUSTOMER;
  const isVerified = Boolean(payload.isVerified);
  const token = signAccessToken({
    id: sub,
    email,
    role,
    isVerified,
  });
  return { token };
}

export function getVerificationLogUrl(token: string) {
  const base =
    process.env.PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_PUBLIC_URL?.replace(/\/$/, "") ||
    "http://localhost:4000";
  return `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}
