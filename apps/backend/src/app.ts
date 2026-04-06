import "dotenv/config";
import express from "express";
import { authRouter } from "./modules/auth/auth.router";
import { orderRouter } from "./modules/order/order.router";
import { reviewRouter } from "./modules/review/review.router";
import { sellerRouter } from "./modules/seller/seller.router";
import { userRouter } from "./modules/user/user.router";
import { errorHandler } from "./middleware/errorHandler";

const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    name: "voltix-api",
    health: "GET /health",
    auth: {
      register: "POST /api/auth/register",
      login: "POST /api/auth/login",
      verifyEmail: "GET /api/auth/verify-email?token=<token>",
      me: "GET /api/auth/me (Authorization: Bearer <token>)",
    },
    orders: {
      create: "POST /api/orders (Bearer)",
      sellerList: "GET /api/orders/seller (Bearer, SELLER)",
    },
    reviews: {
      create: "POST /api/reviews (Bearer)",
    },
    users: {
      me: "GET /api/users/me (Bearer)",
      updateMe: "PATCH /api/users/me (Bearer)",
      password: "PATCH /api/users/me/password (Bearer)",
      orders: "GET /api/users/me/orders (Bearer)",
      addresses: "POST /api/users/me/addresses (Bearer)",
      addressById: "PATCH|DELETE /api/users/me/addresses/:addressId (Bearer)",
    },
    seller: {
      base: "/api/seller (Bearer, SELLER)",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/orders", orderRouter);
app.use("/api/reviews", reviewRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
