import { randomBytes } from "crypto";
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
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
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
  const emailVerificationToken = randomBytes(32).toString("hex");

  const { user, sellerProfile } = await prisma.$transaction(async (tx) => {
    const created = await tx.user.create({
      data: {
        email,
        passwordHash,
        name,
        role,
        isVerified: false,
        emailVerificationToken,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerified: true,
        createdAt: true,
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

  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[auth] Email verification (API): ${getVerificationLogUrl(emailVerificationToken)}`
    );
    const spaOrigin = process.env.AUTH_APP_ORIGIN ?? "http://localhost:3000";
    console.log(
      `[auth] Email verification (UI): ${spaOrigin}/auth/verify-email?token=${encodeURIComponent(emailVerificationToken)}`
    );
  }

  const token = signAccessToken({
    id: user.id,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  });
  const userPayload = publicUserFields(user);
  const message =
    "Обліковий запис створено. Підтвердьте email: у режимі розробки посилання виводиться в консолі API та нижче можна відкрити сторінку підтвердження.";
  if (sellerProfile) {
    return {
      user: userPayload,
      token,
      sellerProfile,
      message,
    };
  }
  return {
    user: userPayload,
    token,
    message,
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
    throw new HttpError(401, "Невірний email або пароль");
  }
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) {
    throw new HttpError(401, "Невірний email або пароль");
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
    },
  });
  if (!user) {
    throw new HttpError(404, "Користувача не знайдено");
  }
  return user;
}

export function getVerificationLogUrl(token: string) {
  const base =
    process.env.PUBLIC_API_URL?.replace(/\/$/, "") ||
    process.env.API_PUBLIC_URL?.replace(/\/$/, "") ||
    "http://localhost:4000";
  return `${base}/api/auth/verify-email?token=${encodeURIComponent(token)}`;
}
