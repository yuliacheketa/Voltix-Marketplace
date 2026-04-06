import { z } from "zod";

const e164 = z.string().regex(/^\+[1-9]\d{1,14}$/);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.union([e164, z.null()]).optional(),
  avatarUrl: z.union([z.string().url().max(500), z.null()]).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(8).max(128).regex(/[A-Z]/).regex(/[0-9]/),
  })
  .superRefine((data, ctx) => {
    if (data.newPassword === data.currentPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "New password must differ from current password",
        path: ["newPassword"],
      });
    }
  });

export const ordersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

const countryIso2 = z
  .string()
  .length(2)
  .transform((s) => s.toUpperCase())
  .refine((s) => /^[A-Z]{2}$/.test(s));

export const createAddressSchema = z.object({
  label: z.string().max(50).optional(),
  fullName: z.string().min(2).max(100),
  phone: e164,
  street: z.string().min(5).max(200),
  city: z.string().min(2).max(100),
  state: z.string().max(100).optional(),
  zip: z.string().min(3).max(20),
  country: countryIso2,
  isDefault: z.boolean().optional().default(false),
});

export const updateAddressSchema = createAddressSchema.partial();

export type UpdateProfileBody = z.infer<typeof updateProfileSchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordSchema>;
export type OrdersQuery = z.infer<typeof ordersQuerySchema>;
export type CreateAddressBody = z.infer<typeof createAddressSchema>;
export type UpdateAddressBody = z.infer<typeof updateAddressSchema>;
