import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      authUser?: { id: string; email: string };
      user?: { userId: string; email: string; role: Role };
    }
  }
}

export {};
