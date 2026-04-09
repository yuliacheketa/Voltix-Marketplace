import "dotenv/config";
import express from "express";
import path from "path";
import { adminRouter } from "./modules/admin/admin.router";
import { authRouter } from "./modules/auth/auth.router";
import { cartRouter } from "./modules/cart/cart.router";
import { catalogRouter } from "./modules/catalog/catalog.router";
import { notificationRouter } from "./modules/notification/notification.router";
import { orderRouter } from "./modules/order/order.router";
import { paymentRouter } from "./modules/payment/payment.router";
import { reviewRouter } from "./modules/review/review.router";
import { sellerRouter } from "./modules/seller/seller.router";
import { userRouter } from "./modules/user/user.router";
import { ensureAvatarsDir } from "./modules/user/user.avatarStorage";
import { errorHandler } from "./middleware/errorHandler";

ensureAvatarsDir();

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

app.use(
  "/api/uploads",
  express.static(path.join(process.cwd(), "uploads"), {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    immutable: true,
  })
);

app.get("/", (_req, res) => {
  res.json({
    success: true,
    data: {
      name: "voltix-api",
      health: "GET /health",
    },
  });
});

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { ok: true } });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/catalog", catalogRouter);
app.use("/api/cart", cartRouter);
app.use("/api/orders", orderRouter);
app.use("/api/payments", paymentRouter);
app.use("/api/seller", sellerRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/admin", adminRouter);

app.use(errorHandler);

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
