import { Role } from "@prisma/client";
import { z } from "zod";

export const registerSchema = z
  .object({
    email: z.string().trim().email("Некоректний email").max(255),
    password: z.string().min(8, "Мінімум 8 символів").max(128),
    confirmPassword: z.string().min(8, "Мінімум 8 символів").max(128),
    role: z.nativeEnum(Role).optional().default(Role.CUSTOMER),
    shopName: z.string().trim().max(100).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Паролі не збігаються",
        path: ["confirmPassword"],
      });
    }
    if (data.role === Role.SELLER) {
      const name = data.shopName;
      if (name == null || name.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Обовʼязково для продавця",
          path: ["shopName"],
        });
      }
    }
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Некоректний email").max(255),
  password: z.string().min(8, "Мінімум 8 символів").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const verifyEmailQuerySchema = z.object({
  token: z.string().min(1),
});

export const refreshTokenSchema = z.object({
  token: z.string().min(1),
});

export type RefreshTokenBody = z.infer<typeof refreshTokenSchema>;
